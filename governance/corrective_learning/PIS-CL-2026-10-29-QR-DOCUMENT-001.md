# Percept Intelligence System — Corrective Learning Record
Record: PIS-CL-2026-10-29-QR-DOCUMENT-001
Date: 2026-10-29
Status: REGISTERED LESSONS; RUNTIME ENFORCEMENT NOT YET CERTIFIED
Company: Percept Administrative Consultancy Services
Scope: Official document generation, branding, serials, QR issuance, registry verification, release claims.

## Evidence and observed failures
1. **QR destination was wrong.** The Afghanistan Business Opportunities 2027 PDF was issued with a QR linking to GitHub rather than the CEO-approved Cloudflare verification website. Root cause: treating a GitHub metadata file as equivalent to a public verification registry entry.
2. **Unregistered QR issued.** An earlier QR for the same document opened a verification page that displayed "No public record found for this verification ID." Root cause: QR generation preceded successful Supabase registration and public lookup.
3. **Premature success claims.** The assistant reported registration/verification completion without independently proving unauthenticated public lookup and the rendered PDF QR end-to-end. Root cause: conflating database write success, GitHub record existence, and live public-site verification.
4. **Repeated rework and unnecessary user validation.** The user had to report failures and request corrections multiple times. Root cause: no mandatory automated pre-delivery fail-closed acceptance gate in this workflow.
5. **Template fidelity risk.** The assistant previously reconstructed/approximated a corporate letterhead from logo/reference material rather than proving use of the exact locked approved master. Root cause: missing template identity/fingerprint comparison.
6. **Incorrect branding/presentation in previous official-document requests.** User reported missing/wrong logo, deviations from approved quotation/invoice formats, and unauthorized layout changes. Root cause: output creation without locked master checks.
7. **Unnecessary visual preview.** A generated test document was accompanied by an unrelated image search instead of an actual PDF render; this did not substantiate document appearance.
8. **Policy-only enforcement gap.** Existing governance describes release controls, but policy text alone does not prove every generator/export route is gated. Do not claim system-wide self-learning or enforcement solely from this record.

## Verified corrective action in this conversation
- Supabase project avjbpkqdocyajmhymepd, table public.percept_public_verifications.
- Business document PERCEPT-BI-2026-1029-01 registered with UUID e7a35e4b-3d0f-42d8-8d2b-9915f26a703c, status verified.
- Test document PERCEPT-QR-TEST-20261029-002 registered with UUID 3f6b79e1-8a44-4a19-b17e-7cbf29a84e02, status verified.
- QR destinations use https://percept2.pages.dev/?id=<UUID>.
- User confirmed the test QR works on the Cloudflare verification page.
- This is evidence of successful individual registrations, NOT evidence of universal automated enforcement.

## Mandatory prevention rules and executable acceptance criteria
A. **Master selection:** identify exact approved master for document type, verify its provenance and fingerprint; reject approximated, recreated, or modified templates without explicit authorization.
B. **Reference integrity:** assign one unique reference and UUID per new document; preserve existing reference/UUID for permitted revisions unless formal reissue is authorized.
C. **Registry-before-QR:** write approved public metadata to Supabase first; confirm returned UUID/reference/issuer/date/status. No write or mismatch => BLOCK.
D. **Approved destination:** only https://percept2.pages.dev/?id=<canonical-UUID>. Never GitHub, ChatGPT, placeholder URLs, or test UUID for business documents.
E. **Public lookup:** independently query live public verification service and compare UUID, reference, issuer, date, status=verified, and test classification. No response, mismatch, or test record for business document => BLOCK.
F. **Rendered PDF:** render PDF; extract/decode QR from FINAL PDF, check exact URL, legibility, page layout, logo centering, text clipping, and correct serial.
G. **Final-file audit:** log PDF SHA-256, QR URL, registry response, master template ID/hash, release gate result, CEO approval and time. Failed or untested step => DO NOT CLAIM VERIFIED OR RELEASED.
H. **Test document labeling:** visible TEST ONLY — NOT VALID FOR BUSINESS USE and public test record must disclose test nature.
I. **No invented proof:** never equate GitHub commit with public registration; never claim that live site was tested if it was not; no invented approval, signature, or stamp.
J. **No abbreviation:** always use the full name Percept Administrative Consultancy Services; never append the prohibited shorthand.

## Regression tests to implement
- Reject GitHub QR URL.
- Reject unregistered UUID.
- Reject UUID/reference mismatch.
- Reject status other than verified.
- Reject test-only record used for business PDF.
- Reject incorrect logo or altered master.
- Reject missing/duplicate serial.
- Reject PDF whose embedded QR differs from registered URL.
- Reject missing final PDF SHA-256 or missing public lookup evidence.
- Positive case: valid registered Cloudflare QR with exact final PDF and approved master passes.

## Governance and accountability
Classification: Preventable document-control and public-verification failures.
Priority: HIGH.
Learning mechanism: This record is a durable repository entry for review, testing, and future integration.
Enforcement status: NOT CERTIFIED. Integrate these cases into centralized release gate, CI and all generator/export routes before claiming automated prevention.
No CEO reapproval is required merely to record these lessons; existing release authorizations remain subject to release-gate checks.
