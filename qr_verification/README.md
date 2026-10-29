# Document verification deployment — 2026-10-29

Status: PARTIALLY DEPLOYED; not ready for public business issuance.

- Existing Supabase public JSON API updated to version 3. Current source: api-compatible.ts. It uses existing schema and reports the demonstration record as test, not business verified.
- Readable mobile verification page deployed at https://percept-document-verification.nakebmohammedi.chatgpt.site with owner-only access. Sites source commit 1bfd6c2270e68f08fe6f92558d22e16d3bb6bca7. No audience change performed.
- Preview checked: existing test correctly labelled TEST RECORD; unknown UUID shows no public record. Live API confirmed HTTP 200 and test status.
- Only one test registry entry exists. No business documents registered in this work. Existing approved masters unchanged.
- Exact-file comparison is unavailable until a registered fingerprint is exposed. Browser hashing currently calculates only; no file upload.
- Legacy HTML Edge Function returns plain text and remains unchanged. Existing printed QR links were not automatically repaired.

## Remaining work
1. Obtain approval for public audience access. New Sites preserve owner-only audience unless an audience change is explicitly requested.
2. Review and authorize PROPOSED_NOT_APPLIED.sql. Automatic approval review rejected it because it combined persistent schema, triggers, privileges, immutability, and a live test-data update. It has NOT been applied. Do not run as a workaround. api-proposed-not-deployed.ts depends on this proposal and is NOT the live API.
3. Validate the migration in a test environment, confirm revocation and permission behavior, then deploy the approved migration/API together. The current compatible API relies on existing anon SELECT permissions; the proposal revokes those, so deployment ordering matters.
4. Integrate approved final-file issuance: allocate ID/QR first, render within approved slot, finalize PDF, compute final SHA-256, register approved public metadata. No business file or master should be modified without its approval workflow.
5. Test actual printed/mobile QR scans, revoked/superseded records, tampered PDF mismatch, unavailable network, and non-owner access. Retire/redirect legacy links only after public frontend access works.

This is a registry lookup, not a digital signature or validation of document claims. The SQL proposal is a review artifact, not a complete security audit or deployment authorization.
