# Percept social and commerce integration foundation

Status: code installed in GitHub repository, NOT deployed, connected or production certified.

## Verified sources
- Meta Instagram API: https://www.postman.com/meta/instagram/collection/6yqw8pt/instagram-api
- TikTok official SDK: https://github.com/tiktok/tiktok-business-api-sdk
- Alibaba.com: https://openapi.alibaba.com/doc/doc.htm
- AliExpress: https://open.aliexpress.com/

## Setup
Install requirements with `pip install -r integrations/requirements.txt` in an isolated environment.
Provision platform developer apps and permissions. Keep tokens in a secret manager; never commit credentials.
Instagram and TikTok have minimal authenticated GET adapters. Endpoints must be chosen
according to granted scopes and current platform API versions.
Alibaba.com and AliExpress adapters are intentionally blocked until official signing
specifications, permitted endpoint products, and app credentials are validated.

## Safeguards
No autonomous publication, messaging, supplier outreach, purchases or payments.
CEO approval is required for all outbound actions. No scraper or unofficial login automation.
No claim of live integration or Google Drive archival without verification.
