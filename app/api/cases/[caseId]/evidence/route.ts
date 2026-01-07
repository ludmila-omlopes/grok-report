import { NextResponse } from "next/server";
import crypto from "crypto";
import { put } from "@vercel/blob";
import { db } from "@/db/client";
import { evidenceFiles, auditLog } from "@/db/schema";
import { requireCaseAuth } from "@/lib/case-auth";

export const runtime = "nodejs"; // important for crypto and file handling

const MAX_BYTES = 15 * 1024 * 1024; // 15MB, adjust as needed
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function sha256Hex(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> | { caseId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const caseId = resolvedParams.caseId;
    console.log("caseId", caseId);
    const token = req.headers.get("x-case-token") ?? "";

    const auth = await requireCaseAuth(caseId, token);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PNG, JPG, or WEBP." },
        { status: 415 }
      );
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File size must be between 1 byte and ${MAX_BYTES} bytes` },
        { status: 413 }
      );
    }

    // Load into memory (OK for small evidence files).
    // If you expect larger files, switch to streaming multipart parsing.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sha256 = sha256Hex(buffer);

    // Storage key: case-scoped, deterministic but not exposing personal data
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const storageKey = `cases/${caseId}/evidence/${sha256}_${safeName}`;

    // Upload to Vercel Blob (private access: controlled via API)
    const blob = await put(storageKey, buffer, {
      access: "private",
      contentType: file.type,
      addRandomSuffix: false,
    });

    // Write metadata to DB
    const [row] = await db
      .insert(evidenceFiles)
      .values({
        caseId,
        storageKey: blob.url,
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        sha256,
      })
      .returning({ id: evidenceFiles.id });

    await db.insert(auditLog).values({
      caseId,
      action: "EVIDENCE_UPLOADED",
      actor: "user",
      userAgent: req.headers.get("user-agent") ?? null,
      // ipHash intentionally omitted (LGPD minimization)
    });

    return NextResponse.json({
      ok: true,
      evidenceId: row.id,
      sha256,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Upload failed", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
