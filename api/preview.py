import re
from html import unescape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

MAX_BYTES = 256_000
TIMEOUT = 5
MAX_REDIRECTS = 3

OG_TITLE_RE = re.compile(
    r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
OG_TITLE_RE_ALT = re.compile(
    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:title["\']',
    re.IGNORECASE,
)
TITLE_RE = re.compile(r"<title[^>]*>([^<]+)</title>", re.IGNORECASE)


def _extract_title(html: str) -> str | None:
    for pattern in (OG_TITLE_RE, OG_TITLE_RE_ALT, TITLE_RE):
        match = pattern.search(html)
        if match:
            title = unescape(match.group(1).strip())
            if title:
                return title[:200]
    return None


def _fetch_html(url: str) -> str:
    current = url
    for _ in range(MAX_REDIRECTS + 1):
        request = Request(
            current,
            headers={"User-Agent": "ShortenerPreview/1.0"},
        )
        try:
            with urlopen(request, timeout=TIMEOUT) as response:
                if 300 <= response.status < 400:
                    location = response.headers.get("Location")
                    if not location:
                        break
                    current = location
                    continue
                raw = response.read(MAX_BYTES + 1)
                if len(raw) > MAX_BYTES:
                    raw = raw[:MAX_BYTES]
                charset = response.headers.get_content_charset() or "utf-8"
                return raw.decode(charset, errors="replace")
        except (HTTPError, URLError, TimeoutError, ValueError):
            return ""
    return ""


def fetch_url_preview(url: str) -> dict[str, str | None]:
    html = _fetch_html(url)
    if not html:
        return {"title": None, "url": url}
    return {"title": _extract_title(html), "url": url}
