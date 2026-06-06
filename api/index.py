import csv
import io
import os
from datetime import date

import validators
from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import HTMLResponse, RedirectResponse, StreamingResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from . import crud
from .auth import require_api_key
from .database import check_database_connection, get_db
from .models import (
    DailyClicks,
    ShortStats,
    StatsResponse,
    StatsSummary,
    TopLink,
    TopReferrer,
    UrlCreate,
    UrlCreateResponse,
    UrlPreviewResponse,
)
from .preview import fetch_url_preview
from .slug import public_slug

RATE_LIMIT_ENABLED = os.environ.get("RATE_LIMIT_ENABLED", "true").lower() == "true"

limiter = Limiter(key_func=get_remote_address, enabled=RATE_LIMIT_ENABLED)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

NOT_FOUND_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Link not found</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; }
    .card { text-align: center; padding: 2.5rem; max-width: 28rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
    p { color: #64748b; margin: 0 0 1.5rem; }
    a { color: #4f46e5; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link not found</h1>
    <p>This short link does not exist or may have been deleted.</p>
    <a href="/">Go home</a>
  </div>
</body>
</html>"""

EXPIRED_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Link expired</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f8fafc; color: #0f172a;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; margin: 0; }
    .card { text-align: center; padding: 2.5rem; max-width: 28rem; }
    h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
    p { color: #64748b; margin: 0 0 1.5rem; }
    a { color: #4f46e5; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Link expired</h1>
    <p>This short link has expired and is no longer available.</p>
    <a href="/">Go home</a>
  </div>
</body>
</html>"""


def raise_bad_request(message: str):
    raise HTTPException(status_code=400, detail=message)


def raise_not_found(url: str):
    message = f"URL '{url}' doesn't exist"
    raise HTTPException(status_code=404, detail=message)


def _parse_date(value: str | None, name: str) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise_bad_request(f"Invalid {name} date. Use YYYY-MM-DD.")


@app.get("/api/health")
def health_check():
    try:
        check_database_connection()
        return {"status": "ok"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/python")
def read_root():
    return "Welcome to the URL shortener API :)"


@app.get("/api/preview", response_model=UrlPreviewResponse)
def preview_url(url: str = Query(...)):
    if not validators.url(url):
        raise_bad_request(message="Your provided URL is not valid")
    result = fetch_url_preview(url)
    return UrlPreviewResponse(url=result["url"], title=result["title"])


@app.post("/api/url", response_model=UrlCreateResponse)
@limiter.limit("20/minute")
def create_url(
    request: Request,
    url: UrlCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_api_key),
):
    requested_url = url.model_dump()["url"]
    alias = url.alias
    expires_in_days = url.expires_in_days

    if not validators.url(requested_url):
        raise_bad_request(message="Your provided URL is not valid")

    if expires_in_days is not None and expires_in_days <= 0:
        raise_bad_request(message="expires_in_days must be a positive number")

    try:
        slug = crud.create_url(
            db=db,
            url=requested_url,
            alias=alias,
            expires_in_days=expires_in_days,
        )
    except ValueError as exc:
        if str(exc) == "ALIAS_TAKEN":
            raise HTTPException(status_code=409, detail="This alias is already taken")
        raise_bad_request(message=str(exc))

    return UrlCreateResponse(public_slug=slug)


@app.get("/api/urls", response_model=list[ShortStats])
def list_urls(db: Session = Depends(get_db)):
    return [ShortStats.from_short(s) for s in crud.list_shorts(db=db)]


@app.get("/api/urls/export")
def export_urls(db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "public_slug",
            "original_url",
            "click_count",
            "created_at",
            "last_clicked_at",
            "expires_at",
        ]
    )
    for short in crud.list_shorts(db=db):
        writer.writerow(
            [
                public_slug(short),
                short.original_url,
                short.click_count,
                short.created_at.isoformat(),
                short.last_clicked_at.isoformat() if short.last_clicked_at else "",
                short.expires_at.isoformat() if short.expires_at else "",
            ]
        )
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=links.csv"},
    )


@app.delete("/api/urls/{slug}")
@limiter.limit("20/minute")
def delete_url(
    request: Request,
    slug: str,
    db: Session = Depends(get_db),
    _: None = Depends(require_api_key),
):
    if not crud.delete_short(db=db, slug=slug):
        raise_not_found(slug)
    return {"status": "deleted"}


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    date_from: str | None = Query(default=None, alias="from"),
    date_to: str | None = Query(default=None, alias="to"),
):
    parsed_from = _parse_date(date_from, "from")
    parsed_to = _parse_date(date_to, "to")
    if parsed_from and parsed_to and parsed_from > parsed_to:
        raise_bad_request(message="'from' must be before or equal to 'to'")

    summary_data = crud.get_stats_summary(
        db=db, date_from=parsed_from, date_to=parsed_to
    )
    top_link = None
    if summary_data["top_link"]:
        short = summary_data["top_link"]
        top_link = TopLink(
            secret_key=short.secret_key,
            original_url=short.original_url,
            click_count=summary_data["top_link_clicks"],
            public_slug=public_slug(short),
        )

    if parsed_from and parsed_to:
        daily = crud.get_daily_clicks(db=db, date_from=parsed_from, date_to=parsed_to)
    else:
        daily = crud.get_daily_clicks(db=db, days=30)

    top_links = [
        TopLink(
            secret_key=s.secret_key,
            original_url=s.original_url,
            click_count=clicks,
            public_slug=public_slug(s),
        )
        for s, clicks in crud.get_top_links(
            db=db, limit=5, date_from=parsed_from, date_to=parsed_to
        )
    ]

    top_referrers = [
        TopReferrer(referrer=referrer, clicks=clicks)
        for referrer, clicks in crud.get_top_referrers(
            db=db, limit=5, date_from=parsed_from, date_to=parsed_to
        )
    ]

    return StatsResponse(
        summary=StatsSummary(
            total_links=summary_data["total_links"],
            total_clicks=summary_data["total_clicks"],
            clicks_today=summary_data["clicks_today"],
            top_link=top_link,
        ),
        daily_clicks=[DailyClicks(date=day, clicks=clicks) for day, clicks in daily],
        top_links=top_links,
        top_referrers=top_referrers,
    )


@app.get("/s/{url_key}")
@limiter.limit("100/minute")
def forward_to_target_url(
    request: Request,
    url_key: str,
    db: Session = Depends(get_db),
):
    short = crud.get_short_by_key(db=db, url_key=url_key)
    if not short:
        return HTMLResponse(NOT_FOUND_HTML, status_code=404)
    if crud.is_expired(short):
        return HTMLResponse(EXPIRED_HTML, status_code=410)

    referrer = request.headers.get("referer")
    user_agent = request.headers.get("user-agent")
    crud.record_click(
        db=db,
        url_key=url_key,
        referrer=referrer,
        user_agent=user_agent,
    )
    return RedirectResponse(short.original_url)
