# Percept international organization data adapters
Seven source entries installed as a **staging registry**: UN Comtrade, IMF, WHO, UNHCR, ILOSTAT, OECD and Eurostat.

Run one source check manually: `python international_apis/sources.py who`.
No third-party dependencies, no stored keys and no outbound messages.

**Important:** A source entry is not a certified live integration. IMF and ILO SDMX dataset queries need further endpoint validation; Eurostat requires valid country/dataset selections. UN Comtrade preview is limited and a free registered subscription key is needed for broader access. UNHCR explicitly disallows use as a high-volume production backend. No automatic scheduled polling is enabled until the terms and endpoint tests are verified.

Official docs:
- https://uncomtrade.org/docs/un-comtrade-api/
- https://data.imf.org/en/Resource-Pages/IMF-API
- https://www.who.int/data/gho/info/gho-odata-api
- https://refugeedata.unhcr.org/en/documentation/technical-reference/api/
- https://ilostat.ilo.org/data/
- https://www.oecd.org/en/data/insights/data-explainers/2024/09/api.html
- https://ec.europa.eu/eurostat/en/web/user-guides/data-browser/api-data-access/api-introduction
