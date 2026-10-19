# CEO Approval — Percept Commercial Document Master Controls
Date: 2026-10-19
Status: CEO APPROVED DESIGN REFERENCE; GATEWAY ENFORCEMENT NOT VERIFIED

## Approval evidence
CEO explicitly confirmed the corrected AWCC 80 L water-heater quotation and pro forma invoice look perfect and directed that the company's policy and master records must always be followed. Approved reference: Percept_AWCC_80L_Water_Heater_Approved_Quotation_Invoice_DRAFT.pdf (two pages).

## Mandatory routing
- QUOTATION -> PERCEPT — OFFICIAL QUOTATION MASTER — Approved Design Reference — Quote 428.pdf (Drive ID 1qVcjPjyFQEJTXqAbg_rblE4s5LZ4OKDM)
- INVOICE -> Percept_Approved_Invoice_Master_428_Design.pdf (Drive ID 1_Igu2OCHJrru8rBAc9qsA-iTFEDH9McD)
- LETTER -> CEO-approved V5 letterhead reference; NOT a replacement for quotation or invoice templates.
- Distinguish pro forma from issued tax/commercial invoice and require valid numbering and transaction approval.

## Pre-release hard stops
1. Classify document type and retrieve correct approved master; fail closed if unavailable.
2. Preserve original logo, slogan, footer, table grid, typography and document-specific geometry.
3. Check client, item, quantity, currency, unit price, extensions and grand total, including currency labels.
4. Check that no old client/project data, sample content, master labels or placeholder fields remain.
5. Check numbering, dates, terms and release authorization; never invent official sequential numbers.
6. Validate text bounds, logo overlap, clipping and visually inspect every page.
7. On any failure or unknown result: BLOCK EXTERNAL RELEASE, log issue and regenerate using approved master.

## Scope and limitations
Approval applies to the accepted AWCC visual reference and the above policy. It is not proof of gateway integration or error-free automated generation. Store immutable copies of approved masters and approved AWCC sample in the asset registry, with SHA-256 hashes, before activating production enforcement. An approval of design does not authorize sending the AWCC documents.
