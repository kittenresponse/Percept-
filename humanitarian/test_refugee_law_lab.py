import unittest
from humanitarian.refugee_law_lab import research_links

class RefugeeLawLabTests(unittest.TestCase):
    def test_links_do_not_claim_verified_results(self):
        result = research_links("Afghanistan")
        self.assertFalse(result["results_verified"])
        self.assertIn("Afghanistan", result["github_repository_search"])
    def test_empty_query_rejected(self):
        with self.assertRaises(ValueError):
            research_links("  ")

if __name__ == "__main__":
    unittest.main()
