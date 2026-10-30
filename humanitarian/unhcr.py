"""Read-only UNHCR data research CLI; Python standard library only."""
import argparse
import json
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api-data.unhcr.org/api/v0"
SERIES = "ResettlementRefugeesUNHCR"

def get(path, params=None):
    url = BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Percept-Humanitarian-Research/0.1"})
    with urllib.request.urlopen(req, timeout=25) as response:
        return json.load(response)

def main():
    parser = argparse.ArgumentParser(description="UNHCR research data (not visa eligibility)")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--catalog", action="store_true")
    group.add_argument("--resettlement", action="store_true")
    args = parser.parse_args()
    if args.catalog:
        data = get("/catalog", {"q": "resettlement", "page_size": 20})
    else:
        data = get("/data/" + SERIES, {"page": 1, "page_size": 20, "dimensions": "default"})
    print(json.dumps({"source": "UNHCR Refugee Data Portal", "research_only": True, "response": data}, indent=2))

if __name__ == "__main__":
    try:
        main()
    except (urllib.error.URLError, ValueError) as exc:
        raise SystemExit("UNHCR API request failed: " + str(exc))
