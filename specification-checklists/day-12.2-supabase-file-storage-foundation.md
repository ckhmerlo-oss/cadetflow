# Day 12.2 - Supabase File Storage Foundation

## Feature / Update Description
Establish a unified Supabase Storage layout and database metadata layer for user-uploaded files across CadetFlow: cadet profile photos, Special Report attachments (Day 10), parent portal documents (Day 11), and an extensible pattern for future modules (work order photos, move-in/out inspection images from Day 09, summary exports from Day 12). Day 12.3 profile overhaul consumes this foundation for avatar display and upload.

## Why This Is Important
CadetFlow currently has no first-class file storage. Profile pages show initials placeholders, Special Reports and parent travel flows cannot attach evidence, and each future feature would otherwise invent its own bucket paths and permission rules. A single storage contract with RLS-aligned metadata prevents duplication, enforces role-scoped access, and keeps sensitive narrative attachments (Day 10) from leaking via public URLs.

## General Implementation Approach

### User View
- Authorized users upload files through in-app controls (profile photo, special report attachments, parent travel documents).
- Uploads show progress, validation errors (type/size), and a preview or filename when complete.
- Users only see files they are permitted to access; deleted or revoked files disappear from UI immediately.
- Profile and roster views can display cadet avatars once Day 12.3 wires the UI (this day delivers storage + API only).

### Backend Perspective
- **Storage buckets** (private by default; access via signed URLs or authenticated download paths):
  - `cadet-avatars` — one active photo per cadet profile; optional thumbnail variant.
  - `special-report-files` — images and PDFs linked to Special Report records (Day 10).
  - `parent-documents` — travel requests, permission slips, and other parent-uploaded files (Day 11).
  - `general-attachments` — reserved namespace for future modules (work orders, inspection photos, admin exports) without new bucket sprawl.
- **Path convention:** `{bucket}/{owner_scope}/{entity_id}/{file_uuid}.{ext}` where `owner_scope` is e.g. `cadet/{profile_id}`, `report/{report_id}`, `parent/{parent_user_id}`.
- **`file_assets` metadata table** (or equivalent) with:
  - `id`, `bucket`, `storage_path`, `original_filename`, `mime_type`, `byte_size`, `checksum` (optional)
  - `entity_type` + `entity_id` (polymorphic link: `cadet_profile`, `special_report`, `parent_submission`, etc.)
  - `purpose` enum (`avatar`, `evidence`, `travel_doc`, `other`)
  - `uploaded_by`, `created_at`, `deleted_at` (soft delete)
  - `is_primary` flag for avatars (only one active primary per cadet)
- **Profile linkage:** add `avatar_file_id` (FK → `file_assets`) on `cadet_profiles` (and optionally `profiles` for staff later).
- **Authorized upload/delete RPCs** (Day 01 pattern): validate role, entity ownership, mime allowlist, and max size before `storage.upload` or service-role write; never expose service role to the client.
- **Storage RLS policies** per bucket aligned with database RLS (cadet sees own avatar; TAC/assigned faculty see cadet files in scope; Special Report files limited to submitter, subject, TAC, admin, assigned oversight).
- **Signed URL helper** with short TTL for client display; cache-bust on avatar replace.
- Register new tables in Day 01 RLS matrix; include in Day 13 integration pass.

## Completion Checklist

### Schema and Storage Layout
- [ ] Define `file_assets` table (columns above) with indexes on `(entity_type, entity_id)` and `(uploaded_by)`.
- [ ] Add `avatar_file_id` nullable FK on `cadet_profiles` referencing `file_assets`.
- [ ] Create migration for buckets: `cadet-avatars`, `special-report-files`, `parent-documents`, `general-attachments`.
- [ ] Document path convention and `purpose` / `entity_type` enums in migration comments or repo doc block.
- [ ] Enable RLS on `file_assets`; add SELECT/INSERT/UPDATE policies per role matrix (Day 01 pattern).

### Storage Policies (Supabase Storage RLS)
- [ ] `cadet-avatars`: cadet upload/replace own; TAC/admin upload for managed cadets; read scoped to viewers who can open the cadet profile.
- [ ] `special-report-files`: submitter insert; read for submitter, subject cadet (if applicable), TAC, site admin, assigned oversight faculty (Day 02); no public read.
- [ ] `parent-documents`: parent insert/read for own submissions linked to their cadet; TAC read for linked cadets; block cross-cadet access.
- [ ] `general-attachments`: deny-by-default; placeholder policies or no client upload until a consuming epic enables them.
- [ ] Grant INSERT + SELECT + UPDATE on buckets where upsert/replace is required (Supabase storage upsert needs all three).

### Upload and Lifecycle RPCs
- [ ] `request_file_upload` (or presigned upload flow): validate mime allowlist, max size, entity permission; return upload path + asset row id.
- [ ] `finalize_file_upload`: verify object exists in storage, set byte size, mark asset active.
- [ ] `set_cadet_avatar`: mark asset as primary, soft-delete prior avatar asset, update `cadet_profiles.avatar_file_id`.
- [ ] `soft_delete_file_asset`: mark deleted, optionally remove storage object via deferred job or immediate admin path.
- [ ] Orphan cleanup job/script for abandoned upload intents (started but never finalized).

### Validation and Security
- [ ] Mime allowlist per bucket (e.g. avatars: `image/jpeg`, `image/png`, `image/webp`; reports: images + `application/pdf`).
- [ ] Max file size limits per bucket (configurable via `app_options` or constants).
- [ ] Reject executable/content-sniff bypass uploads; store with sanitized extensions.
- [ ] No `service_role` in client bundles; uploads go through server actions or RPC + signed upload URL.
- [ ] Audit log entry on avatar change and sensitive file upload/delete (profile audit or dedicated file audit).

### App Integration Hooks (API layer only — UI in Day 12.3 / consumer epics)
- [ ] Shared `lib/fileStorage.ts` (or server module) for signed URL generation and upload orchestration.
- [ ] Server action stubs or hooks documented for: profile avatar, Special Report attachment, parent document (implement UI in Days 10/11/12.3).
- [ ] Update Day 10 checklist dependency note: attachment upload uses Day 12.2 `special-report-files` bucket.
- [ ] Update Day 11 checklist dependency note: parent uploads use Day 12.2 `parent-documents` bucket.

### Testing and Sign-Off
- [ ] Test cadet can upload/replace own avatar; other cadets cannot read/write.
- [ ] Test TAC can upload avatar for roster-managed cadet; faculty outside scope cannot.
- [ ] Test Special Report file upload/read denied for unauthorized roles.
- [ ] Test soft-deleted assets no longer resolve signed URLs.
- [ ] Test archive behavior (Day 06): archived cadets retain file metadata for history but block new uploads unless policy allows admin override.
- [ ] Sign-off criteria: storage buckets, metadata table, RPCs, and RLS policies are deployed in staging; at least one avatar upload round-trip succeeds via server-authorized path without exposing private buckets publicly.
