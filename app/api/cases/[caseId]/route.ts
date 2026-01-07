import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { cases, evidenceFiles } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireCaseAuth } from "@/lib/case-auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> | { caseId: string } }
) {
  const resolvedParams = await Promise.resolve(params);
  const caseId = (resolvedParams.caseId ?? "").trim();
  const token = req.headers.get("x-case-token") ?? "";

  const auth = await requireCaseAuth(caseId, token);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const c = await db
    .select({
      id: cases.id,
      createdAt: cases.createdAt,
      updatedAt: cases.updatedAt,
      victimType: cases.victimType,
      victimHandle: cases.victimHandle,
      infractorHandle: cases.infractorHandle,
      postUrl: cases.postUrl,
      notes: cases.notes,
      involvesNudityOrSexualization: cases.involvesNudityOrSexualization,
      suspectedMinor: cases.suspectedMinor,
      publicOptIn: cases.publicOptIn,
      publicOptInAt: cases.publicOptInAt,
    })
    .from(cases)
    .where(eq(cases.id, caseId))
    .limit(1);

  if (!c[0]) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const ev = await db
    .select({
      id: evidenceFiles.id,
      createdAt: evidenceFiles.createdAt,
      originalFilename: evidenceFiles.originalFilename,
      mimeType: evidenceFiles.mimeType,
      sizeBytes: evidenceFiles.sizeBytes,
      sha256: evidenceFiles.sha256,
    })
    .from(evidenceFiles)
    .where(eq(evidenceFiles.caseId, caseId))
    .orderBy(evidenceFiles.createdAt);

  return NextResponse.json({ ok: true, case: c[0], evidence: ev });
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ caseId: string }> | { caseId: string } }
  ) {
    const resolvedParams = await Promise.resolve(params);
    const caseId = (resolvedParams.caseId ?? "").trim();
    const token = req.headers.get("x-case-token") ?? "";
  
    const auth = await requireCaseAuth(caseId, token);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  
    const body = await req.json();
  
    // Allow-list fields (keep strict)
    const update: any = {};
    if (typeof body.victimHandle === "string") update.victimHandle = body.victimHandle.trim() || null;
    if (typeof body.infractorHandle === "string") update.infractorHandle = body.infractorHandle.trim() || null;
    if (typeof body.postUrl === "string") update.postUrl = body.postUrl.trim() || null;
    if (typeof body.notes === "string") update.notes = body.notes;
    if (["yes", "no", "unknown"].includes(body.involvesNudityOrSexualization))
      update.involvesNudityOrSexualization = body.involvesNudityOrSexualization;
    if (["yes", "no", "unknown"].includes(body.suspectedMinor))
      update.suspectedMinor = body.suspectedMinor;
  
    // Optional: allow toggling public opt-in only one way (safer)
    if (body.publicOptIn === true) {
      update.publicOptIn = true;
      update.publicOptInAt = new Date();
    }
  
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
  
    await db.update(cases).set(update).where(eq(cases.id, caseId));
  
    return NextResponse.json({ ok: true });
  }
  