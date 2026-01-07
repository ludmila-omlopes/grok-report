import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { cases, consentEvents } from "@/db/schema";
import { generateAccessToken, hashToken } from "@/lib/crypto";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
    } = body ?? {};

    if (!consent?.accepted || !consent?.version || !consent?.scopes?.caseProcessing) {
      return NextResponse.json({ error: "Missing consent" }, { status: 400 });
    }

    if (!postUrl) {
      return NextResponse.json({ error: "postUrl is required" }, { status: 400 });
    }

    // 1) Pre-check for duplicate URL
    const existing = await db
      .select({ id: cases.id, createdAt: cases.createdAt })
      .from(cases)
      .where(eq(cases.postUrl, postUrl))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: "Já existe um caso registrado para esta URL.",
          code: "DUPLICATE_POST_URL",
          existingCaseId: existing[0].id,
        },
        { status: 409 }
      );
    }

    // 2) Create new case
    const accessToken = generateAccessToken();
    const accessTokenHash = hashToken(accessToken);

    const [created] = await db
      .insert(cases)
      .values({
        victimType: victimType ?? "self",
        victimHandle: victimHandle ?? null,
        infractorHandle: infractorHandle ?? null,
        postUrl,
        notes: notes ?? null,
        involvesNudityOrSexualization: involvesNudityOrSexualization ?? "unknown",
        suspectedMinor: suspectedMinor ?? "unknown",
        accessTokenHash,
        publicOptIn: !!publicOptIn,
        publicOptInAt: publicOptIn ? new Date() : null,
      })
      .returning({ id: cases.id });

    await db.insert(consentEvents).values({
      caseId: created.id,
      consentVersion: consent.version,
      scopes: consent.scopes,
    });

    return NextResponse.json({ ok: true, caseId: created.id, accessToken });
  } catch (err: any) {
    // Fallback: if a race condition still hits the unique constraint
    if (err?.code === "23505") {
      return NextResponse.json(
        {
          error: "Já existe um caso registrado para esta URL.",
          code: "DUPLICATE_POST_URL",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 }
    );
  }
}
