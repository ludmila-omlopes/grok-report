import { NextResponse } from "next/server";
import crypto from "crypto";
import { put, del } from "@vercel/blob";
import { db } from "@/db/client";
import { cases, consentEvents, evidenceFiles, auditLog } from "@/db/schema";
import { generateAccessToken, hashToken } from "@/lib/crypto";

export const runtime = "nodejs";

const MAX_BYTES = 15 * 1024 * 1024; // per file
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function sha256Hex(buf: Buffer) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

export async function POST(req: Request) {
  const uploadedBlobUrls: string[] = [];

  try {
    const form = await req.formData();

    const payloadRaw = form.get("payload");
    if (!payloadRaw || typeof payloadRaw !== "string") {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const payload = JSON.parse(payloadRaw);

    const {
      victimType,
      victimHandle,
      infractorHandle,
      postUrl,
      notes,
      involvesNudityOrSexualization,
      suspectedMinor,
      consent,
      publicOptIn,
    } = payload ?? {};

    if (!consent?.accepted || !consent?.version || !consent?.scopes?.caseProcessing) {
      return NextResponse.json({ error: "Missing consent" }, { status: 400 });
    }

    // Collect files
    const files = form.getAll("files").filter((x): x is File => x instanceof File);

    // 1) Upload evidence files first (if any)
    const uploadedEvidence: Array<{
      originalFilename: string;
      mimeType: string;
      sizeBytes: number;
      sha256: string;
      blobUrl: string;
    }> = [];

    for (const file of files) {
      if (!ALLOWED_MIME.has(file.type)) {
        throw new Error("Unsupported file type. Use PNG, JPG, or WEBP.");
      }
      if (file.size <= 0 || file.size > MAX_BYTES) {
        throw new Error(`File size must be between 1 byte and ${MAX_BYTES} bytes`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const sha256 = sha256Hex(buffer);

      // Unguessable storage key
      const randomName = crypto.randomBytes(32).toString("hex");
      const storageKey = `evidence/${randomName}`;

      const blob = await put(storageKey, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
        
      });

      uploadedBlobUrls.push(blob.url);

      uploadedEvidence.push({
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        sha256,
        blobUrl: blob.url,
      });
    }

    // 2) Only after uploads succeed: write to DB in a transaction
    const accessToken = generateAccessToken();
    const accessTokenHash = hashToken(accessToken);

    const result = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(cases)
        .values({
          victimType: victimType ?? "self",
          victimHandle: victimHandle ?? null,
          infractorHandle: infractorHandle ?? null,
          postUrl: postUrl ?? null,
          notes: notes ?? null,
          involvesNudityOrSexualization: involvesNudityOrSexualization ?? "unknown",
          suspectedMinor: suspectedMinor ?? "unknown",
          accessTokenHash,
          publicOptIn: !!publicOptIn,
          publicOptInAt: publicOptIn ? new Date() : null,
        })
        .returning({ id: cases.id });

      await tx.insert(consentEvents).values({
        caseId: created.id,
        consentVersion: consent.version,
        scopes: consent.scopes,
      });

      for (const ev of uploadedEvidence) {
        await tx.insert(evidenceFiles).values({
          caseId: created.id,
          storageKey: ev.blobUrl, // store full URL
          originalFilename: ev.originalFilename,
          mimeType: ev.mimeType,
          sizeBytes: ev.sizeBytes,
          sha256: ev.sha256,
        });
      }

      await tx.insert(auditLog).values({
        caseId: created.id,
        action: "CASE_CREATED",
        actor: "user",
        userAgent: req.headers.get("user-agent") ?? null,
      });

      return created.id;
    });

    return NextResponse.json({
      ok: true,
      caseId: result,
      accessToken,
      uploadedCount: uploadedEvidence.length,
    });
  } catch (err: any) {
    // Cleanup any blobs uploaded before failure
    try {
      if (uploadedBlobUrls.length > 0) {
        await del(uploadedBlobUrls);
      }
    } catch {
      // best-effort cleanup; do not mask original error
    }

    // Friendly errors
    const msg = err?.message ?? "Submit failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
