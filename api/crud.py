from datetime import UTC, date, datetime, timedelta

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from . import keygen
from .models import ClickEvent, Short
from .slug import public_slug, validate_slug


def key_exists_by_id(db: Session, key: str) -> bool:
    return db.query(Short).filter(Short.id == key).first() is not None


def slug_exists(db: Session, slug: str) -> bool:
    return (
        db.query(Short)
        .filter(or_(Short.secret_key == slug, Short.custom_slug == slug))
        .first()
        is not None
    )


def _create_unique_id(db: Session) -> str:
    key = keygen.create_random_key()
    while key_exists_by_id(db, key):
        key = keygen.create_random_key()
    return key


def create_url(db: Session, url: str, alias: str | None = None) -> str:
    existing = secret_key_from_existing_url(db, url)
    if existing:
        short = get_short_by_key(db, existing)
        return public_slug(short) if short else existing

    custom_slug = None
    if alias:
        normalized = alias.strip()
        if error := validate_slug(normalized):
            raise ValueError(error)
        if slug_exists(db, normalized):
            raise ValueError("ALIAS_TAKEN")
        custom_slug = normalized

    key = _create_unique_id(db)
    secret_key = f"{key}_{keygen.create_random_key(length=8)}"

    short = Short(
        id=key,
        secret_key=secret_key,
        original_url=url,
        custom_slug=custom_slug,
    )
    db.add(short)
    db.commit()
    db.refresh(short)
    return public_slug(short)


def get_short_by_key(db: Session, url_key: str) -> Short | None:
    return (
        db.query(Short)
        .filter(or_(Short.secret_key == url_key, Short.custom_slug == url_key))
        .first()
    )


def get_url_by_key(db: Session, url_key: str) -> str | None:
    short = get_short_by_key(db, url_key)
    if short:
        return short.original_url
    return None


def secret_key_from_existing_url(db: Session, url: str) -> str | None:
    short = db.query(Short).filter(Short.original_url == url).first()
    if short:
        return short.secret_key
    return None


def delete_short(db: Session, slug: str) -> bool:
    short = get_short_by_key(db, slug)
    if not short:
        return False
    db.delete(short)
    db.commit()
    return True


def record_click(db: Session, url_key: str) -> None:
    short = get_short_by_key(db, url_key)
    if not short:
        return

    now = datetime.now(UTC)
    db.add(ClickEvent(secret_key=short.secret_key, clicked_at=now))
    short.click_count += 1
    short.last_clicked_at = now
    db.commit()


def list_shorts(db: Session) -> list[Short]:
    return db.query(Short).order_by(Short.created_at.desc()).all()


def get_clicks_today(db: Session) -> int:
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(func.count(ClickEvent.id))
        .filter(ClickEvent.clicked_at >= today_start)
        .scalar()
        or 0
    )


def get_daily_clicks(db: Session, days: int = 30) -> list[tuple[date, int]]:
    today = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    start = today - timedelta(days=days - 1)

    rows = (
        db.query(
            func.date(ClickEvent.clicked_at).label("day"),
            func.count(ClickEvent.id).label("clicks"),
        )
        .filter(ClickEvent.clicked_at >= start)
        .group_by(func.date(ClickEvent.clicked_at))
        .order_by(func.date(ClickEvent.clicked_at))
        .all()
    )

    clicks_by_day = {row.day: row.clicks for row in rows}
    result: list[tuple[date, int]] = []
    for i in range(days):
        day = (start + timedelta(days=i)).date()
        result.append((day, clicks_by_day.get(day, 0)))
    return result


def get_top_links(db: Session, limit: int = 5) -> list[Short]:
    return (
        db.query(Short)
        .order_by(Short.click_count.desc(), Short.created_at.desc())
        .limit(limit)
        .all()
    )


def get_stats_summary(db: Session) -> dict:
    total_links = db.query(func.count(Short.id)).scalar() or 0
    total_clicks = db.query(func.coalesce(func.sum(Short.click_count), 0)).scalar() or 0
    clicks_today = get_clicks_today(db)
    top = get_top_links(db, limit=1)
    top_link = top[0] if top and top[0].click_count > 0 else None

    return {
        "total_links": total_links,
        "total_clicks": int(total_clicks),
        "clicks_today": clicks_today,
        "top_link": top_link,
    }
