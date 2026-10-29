# Cloudflare Pages verification frontend

Prepared 2026-10-29. NOT DEPLOYED to Cloudflare: dashboard currently requires owner sign-in. User authorized Cloudflare Pages and authenticated administration.

Pages Git integration settings:
- Repository: kittenresponse/Percept-
- Production branch: main
- Framework: None
- Root directory: qr_verification/cloudflare
- Build command: leave empty
- Build output directory: public
- No frontend secrets or environment variables required.

The public read-only page calls the existing Supabase verification API. Never put a Supabase service-role key in browser files. Static headers restrict scripts and network destinations. Public QR lookups should require no ChatGPT or Cloudflare login.

## Administrative authentication acceptance requirements
The static frontend intentionally has no write endpoints. Registration/approval/revocation must remain unavailable until a server-side authenticated service is implemented. Require named, explicitly allowlisted company administrators; verified identity tokens and MFA for privileged actions; server-side authorization on every mutation; credentials in server secret storage only; audit logs; and unauthorized/expired-session tests. Cloudflare Access can protect an admin application but does not itself grant Supabase write authorization. No client-only password gate is acceptable.

## Still pending
- Owner Cloudflare sign-in and GitHub installation/connection, then Pages deployment.
- Return actual pages.dev URL and test as a signed-out visitor before changing QR links.
- Authentication and issuance integration, approved final-file registration, audit/revocation tests.
- Earlier proposed database migration remains unapplied after approval-review rejection; Cloudflare authorization does not automatically authorize that separate schema/permission proposal.
- Do not replace QR URLs in immutable approved masters; use approved document issuance slots.

Only the existing test registry record is available. Exact-file verification remains unavailable; local PDF hashing does not constitute a registered fingerprint match.
