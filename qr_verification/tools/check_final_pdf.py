#!/usr/bin/env python3
"""Verify the QR actually embedded in a final PDF, then verify the live registry.
Fail closed. This is a release gate, not a digital signature.
Dependencies: pymupdf, opencv-python-headless, numpy.
"""
import argparse, hashlib, json, pathlib, sys
import cv2
import fitz
import numpy as np
from check_release_registry import check

def extract_qr_urls(pdf):
    found = set()
    doc = fitz.open(pdf)
    if doc.page_count < 1:
        raise ValueError("Empty PDF")
    detector = cv2.QRCodeDetector()
    for page in doc:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        image = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        if pix.n == 3:
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        ok, decoded, _, _ = detector.detectAndDecodeMulti(image)
        if ok:
            found.update(s for s in decoded if s)
        else:
            value, _, _ = detector.detectAndDecode(image)
            if value:
                found.add(value)
    return found

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--pdf", required=True)
    p.add_argument("--reference", required=True)
    p.add_argument("--issue-date", required=True)
    p.add_argument("--issuer", default="Percept Administrative Consultancy Services")
    args = p.parse_args()
    try:
        pdf = pathlib.Path(args.pdf)
        if not pdf.is_file() or pdf.read_bytes()[:5] != b"%PDF-":
            raise ValueError("Missing or invalid PDF")
        urls = extract_qr_urls(pdf)
        if len(urls) != 1:
            raise ValueError(f"Expected exactly one unique QR destination, found {len(urls)}")
        url = next(iter(urls))
        record = check(args.reference, url, args.issuer, args.issue_date)
        record["pdf_sha256"] = hashlib.sha256(pdf.read_bytes()).hexdigest()
        record["result"] = "PDF_QR_REGISTRY_PASS"
        print(json.dumps(record, indent=2))
        return 0
    except Exception as exc:
        print("RELEASE BLOCKED: " + str(exc), file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
