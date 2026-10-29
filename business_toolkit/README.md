# Percept on-demand business toolkit

Installed and locally tested on 29 October 2026. No rented server, public hosting, background daemon, external messages or paid service was provisioned. Local installations are temporary; this repository retains the reproducible installation and tests.

## Tools

| Component | Version/source | Verified scope |
|---|---|---|
| urlwatch | 2.29 | Initial snapshot and actual changed-page diff using a synthetic localhost page |
| python-docx-template | 0.20.2 | Template rendering with source checksum, escaped text and unchanged header/footer; unregistered master rejected |
| Frictionless | 5.21.0 | Valid PVC-style CSV accepted; invalid grade and negative price rejected |
| pdfcpu | 0.16.4 | Official Linux x86_64 release checksum checked; valid PDF accepted, merge executed, malformed PDF rejected |
| OCRmyPDF | 17.13.0 | Actual image-only synthetic scan converted to PDF containing searchable invoice text; English tested |
| Datasette Lite | commit 779b2d4da76a5dc2f1d9aea0d7c8d854f6e1497b | Browser application source installed; static entry point, worker, stylesheet and licence checked. Interactive browser execution NOT verified because browser-runtime download failed |

## Reinstall (Linux x86_64, Python 3.12)

Requires git, Tesseract (English), Ghostscript and DejaVu fonts. On Debian/Ubuntu these OS dependencies are provided by `git tesseract-ocr ghostscript fonts-dejavu-core`. Run:

    python3 business_toolkit/install.py
    business_toolkit/.venv/bin/python business_toolkit/selftest.py

The installer creates its own `.venv`, installs the fully pinned Python dependency list, verifies the pdfcpu release archive SHA256 and checks out the exact Datasette Lite revision. It disables the optional upstream analytics script in the local browser copy. It does not modify the existing OCR service or any master template. Reinstallation may need internet and a few minutes. No promise of zero platform/API charges if later run elsewhere.

## Use

From the repository root after installation:

    business_toolkit/.venv/bin/python business_toolkit/toolkit.py validate-prices prices.csv
    business_toolkit/.venv/bin/python business_toolkit/toolkit.py ocr scan.pdf searchable.pdf
    business_toolkit/.venv/bin/python business_toolkit/toolkit.py pdf validate report.pdf
    business_toolkit/.venv/bin/python business_toolkit/toolkit.py pdf merge combined.pdf report.pdf photos.pdf
    business_toolkit/.venv/bin/urlwatch --urls business_toolkit/urls.yaml --config business_toolkit/urlwatch-config.yaml --cache business_toolkit/state/urlwatch.db

Create `business_toolkit/state/` before monitoring. The bundled watch list contains public ADB institutional notices and Navoiyazot's PVC announcement. It is on-demand only, with terminal output only. A baseline or detected change is not verification of a tender, current price, eligibility or deadline. Site restrictions/errors must remain visible; urlwatch may return exit code 0 even when a source fails. Do not equate process success with source success. Persist the cache if adding scheduled execution later.

DOCX generation requires an explicit local checksum registry:

    business_toolkit/.venv/bin/python business_toolkit/toolkit.py render-docx master.docx context.json approved-docx-masters.json draft.docx

The supplied registry is intentionally empty: this installation does not approve or redesign any corporate master. Register only an independently verified CEO-approved tagged DOCX master. This local registry is not an authenticated approval service or protection against administrators. Outputs remain drafts; rendering does not replace the existing validation/release gate.

## Datasette Lite

After installation, `vendor/datasette-lite` contains the upstream browser application and licence. A temporary local static-file server can preview it:

    cd business_toolkit/vendor/datasette-lite
    python3 -m http.server 8009 --bind 127.0.0.1

Open http://127.0.0.1:8009 in a browser. This is a local static preview process, not an application backend or public deployment; stop it when done. The application still downloads its browser Python runtime and packages from external sources. It is not an offline, self-contained installation. Do not assume private authenticated Drive/GitHub URLs will work; no confidential business dataset was loaded or published. Interactive operation remains untested here.

## Scope

There is no automatic monitoring, universal template enforcement, supplier outreach, email dispatch or LinkedIn publication enabled by this package. No subscription credentials were added. The manual GitHub Actions workflow runs only synthetic tests; it is not scheduled. GitHub runner minutes and artifact limits depend on the account. Run results and package versions are in `test-report.json`.
