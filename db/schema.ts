import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    pgEnum,
    uniqueIndex,
  } from "drizzle-orm/pg-core";
  
  // Case lifecycle and retention
  export const caseStatusEnum = pgEnum("case_status", [
    "draft",
    "collecting",
    "ready",
    "exported",
    "archived",
  ]);
  
  export const retentionStatusEnum = pgEnum("retention_status", [
    "active",
    "legally_retained",
    "pending_deletion",
    "deleted",
  ]);
  
  export const reportTypeEnum = pgEnum("report_type", [
    "x",
    "safernet",
    "anpd",
  ]);
  
  export const cases = pgTable(
    "cases",
    {
      id: uuid("id").defaultRandom().primaryKey(),
  
      // Minimal fields required for evidence and legal timeline
      victimType: text("victim_type").notNull(), // "self" | "third_party"
      victimHandle: text("victim_handle"), // optional if third-party does not know
      infractorHandle: text("infractor_handle"),
      postUrl: text("post_url"),
  
      notes: text("notes"),
  
      // Flags (sensitive context but still necessary)
      involvesNudityOrSexualization: text("involves_nudity_or_sexualization").notNull().default("unknown"), // "yes" | "no" | "unknown"
      suspectedMinor: text("suspected_minor").notNull().default("unknown"), // "yes" | "no" | "unknown"
  
      // Timestamps
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  
      status: caseStatusEnum("status").notNull().default("draft"),
      retentionStatus: retentionStatusEnum("retention_status").notNull().default("active"),
  
      // retention policy controls
      retentionUntil: timestamp("retention_until", { withTimezone: true }), // optional
      retentionReason: text("retention_reason"), // optional
  
      // Case ownership concept without requiring accounts:
      // a random secret used to authenticate future edits/exports
      // store only a hash, never store the raw secret
      accessTokenHash: text("access_token_hash").notNull(),
  
      // Optional: anonymized public registry opt-in
      publicOptIn: boolean("public_opt_in").notNull().default(false),
      publicOptInAt: timestamp("public_opt_in_at", { withTimezone: true }),
    },
    (t) => ({
      postUrlIdx: uniqueIndex("cases_post_url_unique").on(t.postUrl),
    })
  );
  
  // Evidence metadata, not the file itself
  export const evidenceFiles = pgTable("evidence_files", {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  
    // storage reference (S3/R2 later), not the content
    storageKey: text("storage_key").notNull(),
    originalFilename: text("original_filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
  
    // integrity
    sha256: text("sha256").notNull(),
  
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  });
  
  // Tracks external reports (X, SaferNet, ANPD)
  export const externalReports = pgTable("external_reports", {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  
    type: reportTypeEnum("type").notNull(),
    initiated: boolean("initiated").notNull().default(false),
  
    // protocol/case number from the authority/platform
    protocolNumber: text("protocol_number"),
  
    // optional evidence, like screenshot of report confirmation
    confirmationEvidenceFileId: uuid("confirmation_evidence_file_id").references(() => evidenceFiles.id),
  
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  });
  
  // Consent is versioned and scoped
  export const consentEvents = pgTable("consent_events", {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  
    consentVersion: text("consent_version").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
  
    scopes: jsonb("scopes").notNull(), // { caseProcessing: true, anonymizedPublicUse: false }
  });
  
  // Minimal audit log for access and data handling
  export const auditLog = pgTable("audit_log", {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").references(() => cases.id, { onDelete: "set null" }),
  
    action: text("action").notNull(), // "CASE_CREATED", "EVIDENCE_UPLOADED", "EXPORT_REQUESTED", etc.
    actor: text("actor").notNull().default("user"), // "user" | "system" | "admin"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  
    // Avoid raw IP storage. Store a hash if you must.
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
  });
  
  // On-chain anchoring record (later)
  export const anchors = pgTable("anchors", {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  
    merkleRoot: text("merkle_root").notNull(),
    chainId: integer("chain_id").notNull(),
    txHash: text("tx_hash").notNull(),
  
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  });
  