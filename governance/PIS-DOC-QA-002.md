# PIS-DOC-QA-002 — Percept Master Document Typography, Margin and Layout Control
Version 1.0 | 19 October 2026 | Status: implementation baseline, subject to CEO approval

## Scope
Mandatory for every Percept PDF, letter, quotation, invoice, proposal, certificate and report, including AI-generated documents. Complements approved letterhead standard and Quotation 428 master; does not replace them.

## Brand precedence
1. Use original approved logo and actual letterhead assets. Do not recreate, crop or stretch.
2. Approved master dimensions override generic defaults. Never claim a generic page is visually compliant merely because margins pass.
3. Where no approved numeric layout specification is recorded, the following are provisional QA tolerances, not assertions of CEO-approved brand measurements.

## Provisional layout tolerances (A4)
- A4 portrait 210 x 297 mm unless approved template specifies otherwise.
- Body text area: minimum left/right clearance 18 mm, top 20 mm and bottom 18 mm; approved header/footer artwork is exempt only when matched to reference.
- Body font 10.5–12 pt; headings 13–17 pt; footnotes at least 8 pt; line leading 1.2–1.45; no unintended font substitutions.
- Header, body and footer must never overlap. Body must start below reserved header and end above reserved footer.
- Table cells must have legible text and adequate internal padding; no clipping, collisions, orphan headings, or uncontrolled page breaks.
- Left-align paragraphs, use consistent hierarchy, avoid full justification when it creates irregular word spacing.
- Ensure contrast, readable dates, reference numbers and source citations.

## Pre-release validation gates
A. Original assets + approved master reference available.
B. A4/page size, margin and text bounding box checks.
C. Font size, embedding/substitution and typography checks.
D. Header/footer collision and text overflow checks.
E. Manual visual comparison against approved master on every page.
F. Facts, attribution, citations and corporate identity verification.
G. CEO approval and signature/stamp when externally issued.

Any FAIL or UNKNOWN = HOLD, INTERNAL DRAFT ONLY. No external distribution. Record failures, corrective action, reviewer, version and evidence. Never auto-certify from code checks alone.

## Failure incident
Afghanistan World Bank Report 2026: user reported incorrect text margins and typography. Treat as open nonconformance until corrected PDF passes gates A–G. Do not silently mark resolved.
