import validators
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from . import crud
from .database import check_database_connection, get_db
from .models import (
    DailyClicks,
    ShortStats,
    StatsResponse,
    StatsSummary,
    TopLink,
    UrlCreate,
    UrlCreateResponse,
)
from .slug import public_slug

app = FastAPI()


def raise_bad_request(message: str):
    raise HTTPException(status_code=400, detail=message)


def raise_not_found(url: str):
    message = f"URL '{url}' doesn't exist"
    raise HTTPException(status_code=404, detail=message)


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


@app.post("/api/url", response_model=UrlCreateResponse)
def create_url(url: UrlCreate, db: Session = Depends(get_db)):
    requested_url = url.model_dump()["url"]
    alias = url.alias

    if not validators.url(requested_url):
        raise_bad_request(message="Your provided URL is not valid")

    try:
        slug = crud.create_url(db=db, url=requested_url, alias=alias)
    except ValueError as exc:
        if str(exc) == "ALIAS_TAKEN":
            raise HTTPException(status_code=409, detail="This alias is already taken")
        raise_bad_request(message=str(exc))

    return UrlCreateResponse(public_slug=slug)


@app.get("/api/urls", response_model=list[ShortStats])
def list_urls(db: Session = Depends(get_db)):
    return [ShortStats.from_short(s) for s in crud.list_shorts(db=db)]


@app.delete("/api/urls/{slug}")
def delete_url(slug: str, db: Session = Depends(get_db)):
    if not crud.delete_short(db=db, slug=slug):
        raise_not_found(slug)
    return {"status": "deleted"}


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    summary_data = crud.get_stats_summary(db=db)
    top_link = None
    if summary_data["top_link"]:
        short = summary_data["top_link"]
        top_link = TopLink(
            secret_key=short.secret_key,
            original_url=short.original_url,
            click_count=short.click_count,
            public_slug=public_slug(short),
        )

    daily = [
        DailyClicks(date=day, clicks=clicks)
        for day, clicks in crud.get_daily_clicks(db=db, days=30)
    ]
    top_links = [
        TopLink(
            secret_key=s.secret_key,
            original_url=s.original_url,
            click_count=s.click_count,
            public_slug=public_slug(s),
        )
        for s in crud.get_top_links(db=db, limit=5)
        if s.click_count > 0
    ]

    return StatsResponse(
        summary=StatsSummary(
            total_links=summary_data["total_links"],
            total_clicks=summary_data["total_clicks"],
            clicks_today=summary_data["clicks_today"],
            top_link=top_link,
        ),
        daily_clicks=daily,
        top_links=top_links,
    )


@app.get("/s/{url_key}")
def forward_to_target_url(url_key: str, db: Session = Depends(get_db)):
    if original_url := crud.get_url_by_key(db=db, url_key=url_key):
        crud.record_click(db=db, url_key=url_key)
        return RedirectResponse(original_url)
    raise_not_found(url_key)
