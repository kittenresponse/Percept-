"""Percept public international data API registry. No secrets or external actions."""
from urllib.request import Request, urlopen
from urllib.parse import urlencode
import json, os

SOURCES = {
 "un_comtrade": {"url":"https://comtradeapi.un.org/public/v1/preview/C/A/HS?flowCode=X&reporterCode=156&period=2023", "format":"json", "note":"Preview only; full free tier requires subscription key."},
 "imf": {"url":"https://api.imf.org/external/sdmx/2.1", "format":"sdmx", "note":"SDMX dataflow selection and access validation required."},
 "who": {"url":"https://ghoapi.azureedge.net/api/Indicator?$top=5", "format":"json"},
 "unhcr": {"url":"https://api-data.unhcr.org/api/v0/catalog?page_size=5", "format":"json", "note":"Low-volume research only; not a production backend."},
 "ilo": {"url":"https://sdmx.ilo.org/rest/v1/dataflow", "format":"sdmx", "note":"Validate ILOSTAT current endpoint and dataset selection."},
 "oecd": {"url":"https://sdmx.oecd.org/public/rest/v1/dataflow/all", "format":"sdmx"},
 "eurostat": {"url":"https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/demo_pjan?geo=AF&lang=EN", "format":"json", "note":"Example query may have no matching data; select a supported geography."}
}
def check(name):
    if name not in SOURCES: raise ValueError("Unknown source")
    source=SOURCES[name]
    req=Request(source["url"],headers={"User-Agent":"PerceptResearch/1.0","Accept":"application/json, application/vnd.sdmx.data+csv, application/xml"})
    with urlopen(req,timeout=20) as response:
        return {"source":name,"http_status":response.status,"content_type":response.headers.get("Content-Type"),"sample_bytes":len(response.read(2048)),"url":source["url"]}
if __name__=="__main__":
    import sys
    print(json.dumps(check(sys.argv[1]),indent=2))
