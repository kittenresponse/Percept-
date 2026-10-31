# Percept Google Drive mandatory archival policy

**Policy:** PERCEPT-ARCHIVE-001 — CEO approved, 31 October 2026.

All Percept-generated artifacts (PDF, PNG, DOCX, XLSX, ZIP, JSON, source code and related files) must be preserved in **Google Drive**, and **never intentionally uploaded to ChatGPT Library for archival**.

## Mandatory fail-closed sequence

1. Generate content locally or in the controlled service.
2. Classify by client/project. If unknown, put in the Drive intake/archive folder.
3. Upload the exact file bytes to Google Drive, using the Percept connected account; use a fixed file name, type and parent folder.
4. Read back the Drive file by its returned ID and verify parent, name, size, MIME, and checksum when available.
5. Store an archive receipt with the Drive file ID and verification result.
6. Mark document `ARCHIVED_VERIFIED` only if step 4 passes. On failure mark `BLOCKED_NOT_ARCHIVED` or `BLOCKED_NOT_VERIFIED`, never `SAVED`.
7. Share a Google Drive link only when the URL was returned from Drive.
8. Keep customer distribution under its own CEO approval/release gate; archiving does not grant publication or outreach authority.

## Enforcement design and platform scope

- **Application-level**: document generators must invoke an archive adapter before returning a success state. Check the receipt server-side, not merely in the UI. Pending states should be retried safely with deduplication.
- **Activepieces**: use an authenticated intake flow, Google Drive Upload File, Google Drive Get File, validation and receipt recording. Do not publish an unauthenticated upload endpoint.
- **ChatGPT**: API integrations/tools must explicitly save generated files to Drive. This policy cannot forcibly intercept ChatGPT chat attachments, files generated in other chats, or the platform's internal storage. Avoid using ChatGPT Library as a deliberate destination.
- **Historical files**: this is a forward-looking rule; previous Library files require a separate verified migration before removal.
- **Confidentiality**: keep private access and choose appropriate folders. Do not send emails, publish documents, or change external access without authorization.

See `config/governance/percept_drive_archive_policy.json` for the machine-readable contract.
