# Percept Intelligence System — Social & Commerce API Feasibility
Date: 2026-10-19
Status: research and integration design only; no platform OAuth connection or production deployment.

## Goal
Use consent-based official APIs to support Percept's marketing intelligence and compliant Chinese procurement sourcing.

## Platform feasibility
- Instagram: Meta Instagram professional account API, with approved scopes and business authorization; own media publishing, comments and authorized insights.
- TikTok: TikTok for Developers Content Posting API, or separate Business API for eligible scopes. App registration, scope consent, review/audit requirements; no public posting without CEO approval.
- Alibaba.com: Alibaba.com Open Platform, developer app, App Key/Secret, API permission and seller authorization where needed. Buyer sourcing availability must be confirmed before promising global supplier search access.
- AliExpress: access depends on approved Open Platform/affiliate/seller products and application permissions; no unsupported arbitrary product scraping.

## Implementation controls
1. Only official APIs and maintained audited SDKs; review licenses, versions, provenance and vulnerabilities.
2. Build isolated per-platform adapters with OAuth/token rotation, rate limits, logging, retries, provenance, audit trails and strict data-minimization.
3. Store secrets only in protected secret manager, never in GitHub or generated documents.
4. Archive approved exports to verified Google Drive storage; never claim sync without write/read verification.
5. Draft posts, messages, supplier outreach, purchase orders and contract commitments require CEO approval before transmission.
6. Use sandbox/mock connectors until developer apps and authorized credentials are provisioned.

## Current deployment status
Planning document added to GitHub only. No platform accounts connected; no API data fetched; no external publication/contact performed.

## Documentation
- https://www.postman.com/meta/workspace/instagram/documentation/23987686-9386f468-7714-490f-9bfc-9442db5c8f00
- https://developers.tiktok.com/docs/en/content-posting-api-get-started
- https://openapi.alibaba.com/doc/doc.htm
- https://developer.alibaba.com/docs/api_list.htm
