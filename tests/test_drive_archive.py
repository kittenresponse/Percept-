"""Unit tests: no real network, verify both success and mandatory failure states."""
import hashlib, json, pathlib, tempfile, unittest
from unittest.mock import patch
from archive_guard.drive_archive import archive_file, ArchiveBlocked

class TestDriveArchive(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.p = pathlib.Path(self.tmp.name) / "invoice.pdf"
        self.p.write_bytes(b"%PDF-1.4\nTEST")
        self.folder = "1lnS1MDNLhBiTgv0aNxoQlFbmmkz0OHIw"

    def test_verified_upload(self):
        data = self.p.read_bytes()
        readback = {"id":"test1","name":self.p.name,"size":str(len(data)),
                    "parents":[self.folder],"md5Checksum":hashlib.md5(data).hexdigest(),
                    "trashed":False,"webViewLink":"https://drive.google.com/test"}
        with patch("archive_guard.drive_archive._api", side_effect=[{"id":"test1"},readback]) as api:
            result = archive_file(self.p, folder_id=self.folder, access_token="mock",
                                  receipt_dir=self.tmp.name)
        self.assertEqual(result["status"], "ARCHIVED_VERIFIED")
        self.assertEqual(api.call_count,2)
        self.assertEqual(len(list(pathlib.Path(self.tmp.name).glob("*.archive-receipt.json"))),1)

    def test_missing_token_fails_closed(self):
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(ArchiveBlocked):
                archive_file(self.p, folder_id=self.folder)

    def test_no_receipt_if_wrong_content(self):
        with patch("archive_guard.drive_archive._api", side_effect=[
                {"id":"test1"}, {"id":"test1","name":self.p.name,"size":123,
                                 "parents":[self.folder],"md5Checksum":"wrong"}]):
            with self.assertRaises(ArchiveBlocked):
                archive_file(self.p,folder_id=self.folder,access_token="mock",receipt_dir=self.tmp.name)
        self.assertEqual(list(pathlib.Path(self.tmp.name).glob("*.archive-receipt.json")),[])

    def test_no_upload_if_missing_file(self):
        with self.assertRaises(ArchiveBlocked):
            archive_file(self.p.with_name("missing.pdf"),folder_id=self.folder,access_token="mock")

if __name__ == "__main__":
    unittest.main()
