#!/usr/bin/env python3
"""Archive GitHub incidents safely. Triggered by percept-mistake label."""
import json
import os
from pathlib import Path
from datetime import datetime, timezone

event = json.loads(Path(os.environ["EVENT_PATH"]).read_text())
issue = event.get("issue")
if not issue:
    print("No issue payload; manual dispatch has nothing to archive.")
    raise SystemExit(0)
labels = [x["name"] for x in issue.get("labels", [])]
if "percept-mistake" not in labels:
    print("Not a labeled incident; skipped.")
    raise SystemExit(0)
number = int(issue["number"])
record = {
    "schema": "percept-incident-v1",
    "source": "github_issue",
    "issue_number": number,
    "issue_url": issue["html_url"],
    "title": issue.get("title", ""),
    "description": issue.get("body", ""),
    "labels": labels,
    "issue_state": issue.get("state"),
    "issue_created_at": issue.get("created_at"),
    "issue_updated_at": issue.get("updated_at"),
    "archived_at": datetime.now(timezone.utc).isoformat(),
    "classification": "reported_unverified",
    "remediation": "Requires triage, root-cause review, and executable regression test"
}
folder = Path("governance/learning/incidents")
folder.mkdir(parents=True, exist_ok=True)
(folder / f"GH-ISSUE-{number:06d}.json").write_text(json.dumps(record, indent=2, ensure_ascii=False) + "\n")
print(f"Archived incident #{number}")
