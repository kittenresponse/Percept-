"""Public Refugee Law Lab research resource registry. No bulk dataset downloads."""
import argparse
import json
from urllib.parse import quote

RESOURCES = {
    "reporter": {"url": "https://refugeelab.ca/bulk-data/rllr/", "type": "Canadian positive refugee decisions"},
    "rpd": {"url": "https://refugeelab.ca/bulk-data/rpd/", "type": "Legacy Canadian first-instance refugee decisions (2002-2020)"},
    "rad": {"url": "https://refugeelab.ca/bulk-data/rad/", "type": "Canadian refugee appeals"},
    "github": {"url": "https://github.com/Refugee-Law-Lab", "type": "Public research code"},
    "a2aj_api": {"url": "https://api.a2aj.ca/docs", "type": "Successor Canadian legal data API documentation"}
}

def research_links(term):
    """Generate human-review links; never claim matching cases were found."""
    term = term.strip()
    if not term or len(term) > 150:
        raise ValueError("Provide a search term of 1-150 characters")
    return {"query": term, "github_repository_search": "https://github.com/search?q=" + quote("org:Refugee-Law-Lab " + term) + "&type=code",
            "resources": RESOURCES, "results_verified": False, "legal_advice": False,
            "warning": "Dataset licenses may prohibit commercial reuse. Verify primary decisions and current law."}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True)
    print(json.dumps(research_links(parser.parse_args().query), indent=2))
