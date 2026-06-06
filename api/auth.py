import os

from fastapi import Header, HTTPException

ADMIN_API_KEY = os.environ.get("ADMIN_API_KEY", "").strip() or None


def require_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    if not ADMIN_API_KEY:
        return
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
