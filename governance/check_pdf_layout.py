"""Provisional Percept PDF layout gate. Requires: pip install pymupdf
Usage: python governance/check_pdf_layout.py report.pdf
This automated test does NOT replace reference-image comparison or CEO approval.
"""
import sys, json
import fitz

def inspect(path):
    doc=fitz.open(path)
    issues=[]
    for i,page in enumerate(doc,1):
        w,h=page.rect.width,page.rect.height
        if abs(w-595.28)>3 or abs(h-841.89)>3:
            issues.append(f"page {i}: not A4 portrait")
        for block in page.get_text("dict")["blocks"]:
            if "lines" not in block: continue
            for line in block["lines"]:
                for span in line["spans"]:
                    text=span["text"].strip()
                    if not text: continue
                    x0,y0,x1,y1=span["bbox"]
                    if x0<0 or y0<0 or x1>w or y1>h:
                        issues.append(f"page {i}: text outside page: {text[:30]}")
                    if span["size"]<8:
                        issues.append(f"page {i}: font below 8pt: {text[:30]}")
    return {"file":path,"pages":len(doc),"automated_status":"FAIL" if issues else "PASS_WITH_MANUAL_REVIEW_REQUIRED","issues":issues,"manual_checks":["original logo and letterhead","body margins excluding approved header/footer","typography and line spacing","header/footer collisions","CEO release approval"]}
if __name__=="__main__":
    report=inspect(sys.argv[1])
    print(json.dumps(report,indent=2))
    sys.exit(1 if report["issues"] else 0)
