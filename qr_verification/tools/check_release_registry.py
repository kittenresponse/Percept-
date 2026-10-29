#!/usr/bin/env python3
"""Fail-closed pre-release registry gate. Never approves documents by itself."""
import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid

API = "https://avjbpkqdocyajmhymepd.supabase.co/functions/v1/percept-verification-api"
SITE = "https://percept2.pages.dev/"

def check(reference, url, issuer, issue_date):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "percept2.pages.dev" or parsed.path not in ("", "/"):
        raise ValueError("QR must target the approved HTTPS verification host")
    query = urllib.parse.parse_qs(parsed.query, keep_blank_values=True)
    if set(query) != {"id"} or len(query["id"]) != 1:
        raise ValueError("QR must carry exactly one id parameter")
    token = str(uuid.UUID(query["id"][0]))
    if token != query["id"][0].lower():
        raise ValueError("Noncanonical UUID")
    req = urllib.request.Request(API + "?id=" + urllib.parse.quote(token), headers={"Accept": "application/json", "User-Agent": "Percept-release-gate/1"})
    with urllib.request.urlopen(req, timeout=15) as response:
        if response.status != 200:
            raise ValueError("Registry lookup failed")
        record = json.load(response)
    if record.get("document_reference") != reference:
        raise ValueError("Registry reference mismatch")
    if record.get("issuer_public") != issuer:
        raise ValueError("Issuer mismatch")
    if record.get("issued_on") != issue_date:
        raise ValueError("Issue date mismatch")
    if record.get("status") != "verified" or record.get("is_test") or str(record.get("title_public", "")).upper().startswith("TEST ONLY"):
        raise ValueError("Record not approved for business verification")
    return {"verification_id": token, "reference": reference, "registry_status": "verified", "result": "REGISTRY_PASS_ONLY"}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference", required=True)
    parser.add_argument("--qr-url", required=True)
    parser.add_argument("--issuer", default="Percept Administrative Consultancy Services")
    parser.add_argument("--issue-date", required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(check(args.reference, args.qr_url, args.issuer, args.issue_date)))
    except (ValueError, urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        print("RELEASE BLOCKED: " + str(exc), file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
