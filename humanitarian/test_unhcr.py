import unittest
from unittest.mock import patch
from humanitarian.unhcr import get

class ApiTests(unittest.TestCase):
    @patch("humanitarian.unhcr.urllib.request.urlopen")
    def test_catalog(self, mocked):
        mocked.return_value.__enter__.return_value.read.return_value = b'{"data":[]}'
        self.assertEqual(get("/catalog", {"q": "resettlement"}), {"data": []})
        self.assertIn("/catalog?", mocked.call_args.args[0].full_url)

if __name__ == "__main__":
    unittest.main()
