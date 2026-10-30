# Humanitarian Pathways Research Module

Read-only, free UNHCR Refugee Data Portal integration. This provides statistical context, **not** individual humanitarian visa eligibility or programme availability. Official immigration authority pages must be independently checked before any pathway is marked open.

Run: `python humanitarian/unhcr.py --catalog` or `python humanitarian/unhcr.py --resettlement`.

No personal documents, credentials, applications or messages are transmitted. No automated submissions. Do not deploy high-frequency scheduled polling: UNHCR's API is intended for research and occasional integrations, not a production backend. See https://refugeedata.unhcr.org/en/documentation/technical-reference/api/.
