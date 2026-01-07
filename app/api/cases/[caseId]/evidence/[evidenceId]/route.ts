import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { auditLog, evidenceFiles } from "@/db/schema";
import { requireCaseAuth } from "@/lib/case-auth";
import { eq, and } from "drizzle-orm";

export const runtime = "nodejs";

function safeFilename(name: string) {
  // conservative filename sanitization for Content-Disposition
  return name.replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ caseId: string; evidenceId: string }> | { caseId: string; evidenceId: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const caseId = resolvedParams.caseId;
  const evidenceId = resolvedParams.evidenceId;

  const token = req.headers.get("x-case-token") ?? "";
  const auth = await requireCaseAuth(caseId, token);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // Fetch evidence record and ensure it belongs to this case
  const rows = await db
    .select({
      id: evidenceFiles.id,
      caseId: evidenceFiles.caseId,
      storageKey: evidenceFiles.storageKey,
      originalFilename: evidenceFiles.originalFilename,
      mimeType: evidenceFiles.mimeType,
      sizeBytes: evidenceFiles.sizeBytes,
    })
    .from(evidenceFiles)
    .where(and(eq(evidenceFiles.id, evidenceId), eq(evidenceFiles.caseId, caseId)))
    .limit(1);

  const ev = rows[0];
  if (!ev) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  // We expect a full URL stored in storageKey
  if (!ev.storageKey || !ev.storageKey.startsWith("http")) {
    return NextResponse.json(
      {
        error:
          "Storage reference is not a URL. Update uploads to store blob.url in storageKey.",
      },
      { status: 500 }
    );
  }

  // Fetch the blob server-side
  const upstream = await fetch(ev.storageKey);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Failed to fetch stored evidence" },
      { status: 502 }
    );
  }

  const url = new URL(req.url);
  const download = url.searchParams.get("download") === "1";

  const filename = safeFilename(ev.originalFilename || "evidence");
  const disposition = download
    ? `attachment; filename="${filename}"`
    : `inline; filename="${filename}"`;

  // Log access (LGPD: auditability)
  await db.insert(auditLog).values({
    caseId,
    action: download ? "EVIDENCE_DOWNLOADED" : "EVIDENCE_VIEWED",
    actor: "user",
    userAgent: req.headers.get("user-agent") ?? null,
  });

  // Stream response to client without revealing the upstream URL
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": ev.mimeType || upstream.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
      // content-length is optional; upstream may provide it
      ...(upstream.headers.get("content-length")
        ? { "Content-Length": upstream.headers.get("content-length")! }
        : {}),
    },
  });
}
