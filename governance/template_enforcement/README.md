# Percept template enforcement

Deployed 29 October 2026 to Activepieces flow qjVH5ZZslEse1Lrz6BFcL.

## Implemented
- Downloads actual archived file through authenticated Google Drive action.
- Restricts file-reference host and storage redirects; limits compressed and expanded sizes.
- Computes output/archive SHA256 rather than trusting entered hashes.
- Compares every Huawei workbook ZIP member against a pinned master fingerprint.
- Only eight item/date/amount cells may change, with original cell style preserved.
- Checks numeric quantity, matching dates, total arithmetic and permitted formulas.
- Rejects changes to identities, shared strings, images, signatures, worksheets, relationships, styles, dimensions, merges and print settings.
- Persists template outcome and release-blocking reasons to the enforcement audit table.
- Does not send documents or grant external sharing.

## Scope and limitations
This is document-control intake enforcement, NOT universal system enforcement.
Only Huawei XLSX has a verified comparison profile. PDF quotations, invoices, letters, reports, DOCX, PPTX, graphics and other types fail closed pending separate profiles. Image changes and new photo pages also fail closed pending a separately verified profile. Office reserialization can produce a conservative rejection even when appearance is unchanged. Visual rendering still requires review.

The master is an approved completed reference; its PASS proves structural comparison, not that a new transaction is complete or approved. Approval identity/signatures, atomic serial reservations, authenticated dispatch, and every external application route remain unverified. The final release decision is always BLOCK. Registry prose and this code do not lock files against administrators or control files created outside the gate. A record-update trigger is not installed: edited records require a new validation request. No production certification is claimed.

## Running
Node.js 20+; no npm dependencies:

    node verifier.cjs /path/to/report.xlsx 'Huawei Acceptance Report'

Exit 0 means template comparison passed, not authorization to release. Actual master bytes are not committed. `huawei-profile.json` contains only fingerprints and permitted cell coordinates. Retrieve the approved master privately and verify its pinned SHA256 before rebuilding any profile. Never regenerate a profile from an unapproved output.

## Evidence
14 local tests against the actual master: allowed item edit passes; receiver, logo, styles, merges, quantity, formulas, package parts, macros, print settings, signature, malformed ZIP and truncation reject. Test results are in test-results.json. Cloud sample-data run f9s8zfjEl8xz9DtGsW4Up downloaded and verified actual Drive master bytes. Production-trigger results are recorded separately.
