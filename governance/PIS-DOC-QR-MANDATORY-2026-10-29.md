# Mandatory QR verification for every official document

**Issuer:** Percept Administrative Consultancy Services  
**CEO instruction date:** 29 October 2026  
**Policy:** Mandatory; no separate user request required.

Every official document generated for the company, including invoices, quotations, acceptance reports, recommendation letters, certificates, official correspondence, proposals and reports, must have exactly one approved verification QR code by default. This is a non-optional requirement. The document generator must never ask the CEO whether to add a QR.

Before release, the generator must (1) select the approved locked master template for that document type, (2) allocate and register a unique UUID tied to the document reference, issuer, date, status and approved public metadata, (3) insert the verification QR into the approved designated area without modifying master layout, (4) render the final PDF, (5) decode the QR from that final rendered PDF, (6) query the live verification registry and check the UUID, document reference, issuer, issue date and verified status, and (7) record the SHA-256 and validation outcome in the release audit log. **Any failure must block final release.**

QR verification confirms a registry record, not the truth of every statement, the CEO's signature, or cryptographic document authenticity. Private data must not be exposed through public QR records. Signature and stamp must not be fabricated.

**Integration requirement:** The QR check must be a centralized, fail-closed release gateway called by *every* document generator and export path. Adding this policy file does not by itself establish runtime enforcement. Do not report universal enforcement as complete until all generation routes and GitHub CI tests have been enumerated, connected, executed and verified. Existing verified QR scripts: `qr_verification/tools/check_release_registry.py` and `qr_verification/tools/check_final_pdf.py`.
