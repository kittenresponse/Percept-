"""Percept World Bank Indicators API v2 client (stdlib only)."""
import json
import re
from urllib.request import urlopen
from urllib.parse import urlencode

BASE="https://api.worldbank.org/v2"
COUNTRY=re.compile(r"^[A-Za-z]{2,3}$")
INDICATOR=re.compile(r"^[A-Za-z0-9_.]{3,60}$")
def fetch(country, indicator, recent=5):
    if not COUNTRY.fullmatch(country) or not INDICATOR.fullmatch(indicator):
        raise ValueError("Invalid country or indicator")
    if not isinstance(recent,int) or not 1 <= recent <= 20:
        raise ValueError("recent must be 1..20")
    url=f"{BASE}/country/{country.upper()}/indicator/{indicator}?"+urlencode({"format":"json","mrnev":recent,"per_page":recent})
    with urlopen(url, timeout=25) as response:
        result=json.load(response)
    if not isinstance(result,list) or len(result)<2 or not isinstance(result[1],list):
        raise RuntimeError(f"World Bank API response invalid: {result!r}"[:300])
    return {"source":"World Bank Indicators API v2","source_url":url,"lastupdated":result[0].get("lastupdated"),"records":[{"country":r.get("country",{}).get("value"),"indicator":r.get("indicator",{}).get("value"),"year":r.get("date"),"value":r.get("value")} for r in result[1]]}
