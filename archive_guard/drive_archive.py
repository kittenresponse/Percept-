"""Percept mandatory Google Drive archive adapter (PERCEPT-ARCHIVE-001).

Call archive_file(...) from every controlled document generator before claiming completion.
No ChatGPT Library integration. Requires an existing OAuth token and Drive upload scope.
"""
from __future__ import annotations
import hashlib, json, mimetypes, os, pathlib, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timezone

class ArchiveBlocked(RuntimeError):
    pass

def _api(url: str, token: str, method: str = "GET", payload: bytes | None = None,
         content_type: str | None = None) -> dict:
    headers = {"Authorization": "Bearer " + token, "Accept": "application/json"}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(url, data=payload, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.loads(response.read())
    except (urllib.error.HTTPError, urllib.error.URLError, ValueError) as e:
        raise ArchiveBlocked("Google Drive request failed: " + str(e)) from e

def archive_file(file_path: str | pathlib.Path, *, folder_id: str,
                 access_token: str | None = None, receipt_dir: str | pathlib.Path | None = None) -> dict:
    source = pathlib.Path(file_path)
    if not source.is_file() or source.stat().st_size == 0:
        raise ArchiveBlocked("Document missing or empty")
    if not folder_id or "/" in folder_id or folder_id == "root":
        raise ArchiveBlocked("Explicit approved Google Drive folder ID required")
    token = access_token or os.environ.get("PERCEPT_GOOGLE_DRIVE_ACCESS_TOKEN", "")
    if not token:
        raise ArchiveBlocked("Google Drive access token not configured")

    data = source.read_bytes()
    md5 = hashlib.md5(data).hexdigest()  # Compare against Google Drive's md5Checksum.
    sha256 = hashlib.sha256(data).hexdigest()
    mime = mimetypes.guess_type(source.name)[0] or "application/octet-stream"
    metadata = json.dumps({"name": source.name, "parents": [folder_id]}).encode()
    boundary = "percept_archive_boundary_20261031"
    upload = (("--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n").encode()
              + metadata + ("\r\n--"+boundary+"\r\nContent-Type: "+mime+"\r\n\r\n").encode()
              + data + ("\r\n--"+boundary+"--\r\n").encode())
    result = _api("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,mimeType,parents,md5Checksum,webViewLink",
                  token, "POST", upload, "multipart/related; boundary="+boundary)
    file_id = result.get("id")
    if not isinstance(file_id, str) or not file_id:
        raise ArchiveBlocked("Drive upload returned no file ID")

    fields = urllib.parse.quote("id,name,size,mimeType,parents,md5Checksum,trashed,webViewLink")
    readback = _api("https://www.googleapis.com/drive/v3/files/" +
                    urllib.parse.quote(file_id, safe="") + "?fields=" + fields, token)
    if (readback.get("id") != file_id or readback.get("name") != source.name
            or str(readback.get("size")) != str(len(data))
            or folder_id not in readback.get("parents", [])
            or readback.get("trashed", False)
            or readback.get("md5Checksum", "").lower() != md5):
        raise ArchiveBlocked("Drive readback / byte checksum mismatch; archive NOT verified")

    receipt = {"policy_id":"PERCEPT-ARCHIVE-001", "status":"ARCHIVED_VERIFIED",
               "filename":source.name, "size_bytes":len(data), "sha256":sha256,
               "md5":md5, "drive_file_id":file_id, "drive_folder_id":folder_id,
               "drive_link":readback.get("webViewLink"), 
               "archived_at":datetime.now(timezone.utc).isoformat()}
    if receipt_dir is not None:
        dest = pathlib.Path(receipt_dir)
        dest.mkdir(parents=True, exist_ok=True)
        safe = hashlib.sha256(file_id.encode()).hexdigest()[:16]
        (dest / (safe + ".archive-receipt.json")).write_text(json.dumps(receipt,indent=2))
    return receipt
