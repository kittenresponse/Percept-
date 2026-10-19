# Percept World Bank Market Intelligence

Uses the official public World Bank Indicators API v2. No key, account, third-party SDK, or pip dependency required.

## Usage
Run `python worldbank/report.py` from the repository root. Results are saved as JSON. The GitHub Actions workflow supports manual dispatch and a weekly Monday run at 05:23 UTC. Reports are workflow artifacts, not commits or Google Drive sync.

Coverage: Afghanistan, China, Uzbekistan, Turkey. Indicators: GDP, inflation, trade share of GDP, population. Most recent non-empty observations are used, with year and source URL preserved. World Bank historical indicators are **not** real-time commodity or transport prices.

## Verification
GitHub workflow success and report artifact retrieval must be checked separately. API failures cause the workflow to fail; no fabricated values are substituted.
Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
