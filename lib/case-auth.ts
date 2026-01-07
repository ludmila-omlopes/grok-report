import crypto from "crypto";
import { db } from "@/db/client";
import { cases } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashToken } from "@/lib/crypto";

function timingSafeEqualHex(a: string, b: string) {
  const aa = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function requireCaseAuth(caseId: string, rawToken: string) {
  console.log("caseId", caseId)
  console.log("rawToken", rawToken)
  // Validate caseId format
  if (!caseId || typeof caseId !== "string") {
    return { ok: false as const, error: "Invalid case ID" };
  }

  // Validate UUID format
  if (!UUID_REGEX.test(caseId)) {
    return { ok: false as const, error: "Invalid case ID format" };
  }

  if (!rawToken || rawToken.length < 20) {
    return { ok: false as const, error: "Missing or invalid token" };
  }

  try {
    const rows = await db
      .select({ id: cases.id, tokenHash: cases.accessTokenHash, retentionStatus: cases.retentionStatus })
      .from(cases)
      .where(eq(cases.id, caseId))
      .limit(1);

    const found = rows[0];
    if (!found) return { ok: false as const, error: "Case not found" };

    if (found.retentionStatus === "deleted") {
      return { ok: false as const, error: "Case deleted" };
    }

    const computed = hashToken(rawToken);
    const ok = timingSafeEqualHex(computed, found.tokenHash);

    if (!ok) return { ok: false as const, error: "Unauthorized" };

    return { ok: true as const, caseId: found.id };
  } catch (err) {
    console.error("[requireCaseAuth] Database error:", err);
    return { ok: false as const, error: "Database error" };
  }
}
