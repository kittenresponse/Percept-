"""Percept consent-gated social/commerce API connector foundation.
No requests are sent without configured credentials and explicit invocation.
"""
import os
import requests

class ConnectorError(RuntimeError):
    pass

class Connector:
    def __init__(self, name, base_url, token_env):
        self.name, self.base_url, self.token_env = name, base_url.rstrip("/"), token_env

    def configured(self):
        return bool(os.getenv(self.token_env))

    def get(self, path, params=None):
        token = os.getenv(self.token_env)
        if not token:
            raise ConnectorError(f"{self.name}: authorization not configured")
        if not path.startswith("/") or path.startswith("//") or "://" in path:
            raise ConnectorError("Only relative API paths are permitted")
        response = requests.get(
            self.base_url + path,
            headers={"Authorization": f"Bearer {token}"},
            params=params,
            timeout=20,
            allow_redirects=False,
        )
        response.raise_for_status()
        return response.json()

CONNECTORS = {
    "instagram": Connector("instagram", "https://graph.instagram.com", "PERCEPT_INSTAGRAM_ACCESS_TOKEN"),
    "tiktok": Connector("tiktok", "https://business-api.tiktok.com/open_api", "PERCEPT_TIKTOK_ACCESS_TOKEN"),
}
# Alibaba.com and AliExpress require app-key/secret signatures and product-specific
# permissions. Do not substitute generic bearer authentication for their official signing.
