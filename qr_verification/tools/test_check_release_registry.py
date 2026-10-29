"""Unit tests for the release gate (network mocked)."""
import importlib.util
import io
import json
import pathlib
import unittest
from unittest.mock import patch

path = pathlib.Path(__file__).with_name("check_release_registry.py")
spec = importlib.util.spec_from_file_location("gate", path)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
TOKEN = "0f36db9b-3d72-4d8d-b6a9-4e6257537c5c"
URL = "https://percept2.pages.dev/?id=" + TOKEN
REFERENCE = "PERCEPT/REC/2026/001"
RECORD = {"document_reference": REFERENCE, "issuer_public": "Percept Administrative Consultancy Services", "issued_on": "2026-10-19", "status": "verified"}

class Response:
    status = 200
    def __init__(self, record):
        self.payload = json.dumps(record).encode()
    def __enter__(self):
        return io.BytesIO(self.payload)
    def __exit__(self, *args):
        pass

class GateTests(unittest.TestCase):
    def test_valid_record(self):
        with patch.object(gate.urllib.request, "urlopen", return_value=Response(RECORD)):
            self.assertEqual(gate.check(REFERENCE, URL, RECORD["issuer_public"], "2026-10-19")["result"], "REGISTRY_PASS_ONLY")

    def test_reference_as_id_rejected(self):
        with self.assertRaises(ValueError):
            gate.check(REFERENCE, "https://percept2.pages.dev/?id=PERCEPT%2FREC%2F2026%2F001", RECORD["issuer_public"], "2026-10-19")

    def test_wrong_host_rejected(self):
        with self.assertRaises(ValueError):
            gate.check(REFERENCE, URL.replace("percept2.pages.dev", "example.com"), RECORD["issuer_public"], "2026-10-19")

    def test_wrong_record_rejected(self):
        with patch.object(gate.urllib.request, "urlopen", return_value=Response({**RECORD, "document_reference": "WRONG"})):
            with self.assertRaises(ValueError):
                gate.check(REFERENCE, URL, RECORD["issuer_public"], "2026-10-19")

    def test_revoked_rejected(self):
        with patch.object(gate.urllib.request, "urlopen", return_value=Response({**RECORD, "status": "revoked"})):
            with self.assertRaises(ValueError):
                gate.check(REFERENCE, URL, RECORD["issuer_public"], "2026-10-19")

    def test_test_record_rejected(self):
        with patch.object(gate.urllib.request, "urlopen", return_value=Response({**RECORD, "is_test": True})):
            with self.assertRaises(ValueError):
                gate.check(REFERENCE, URL, RECORD["issuer_public"], "2026-10-19")

if __name__ == "__main__":
    unittest.main()
