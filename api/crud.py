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


def is_expired(short: Short, *, now: datetime | None = None) -> bool:
    if short.expires_at is None:
        return False
    current = now or datetime.now(UTC)
    expires = short.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
    return current >= expires


def create_url(
    db: Session,
    url: str,
    alias: str | None = None,
    expires_in_days: int | None = None,
) -> str:
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

    expires_at = None
    if expires_in_days is not None and expires_in_days > 0:
        expires_at = datetime.now(UTC) + timedelta(days=expires_in_days)

    key = _create_unique_id(db)
    secret_key = f"{key}_{keygen.create_random_key(length=8)}"

    short = Short(
        id=key,
        secret_key=secret_key,
        original_url=url,
        custom_slug=custom_slug,
        expires_at=expires_at,
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
    if not short or is_expired(short):
        return None
    return short.original_url


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


def record_click(
    db: Session,
    url_key: str,
    *,
    referrer: str | None = None,
    user_agent: str | None = None,
) -> None:
    short = get_short_by_key(db, url_key)
    if not short or is_expired(short):
        return

    now = datetime.now(UTC)
    db.add(
        ClickEvent(
            secret_key=short.secret_key,
            clicked_at=now,
            referrer=referrer,
            user_agent=user_agent,
        )
    )
    short.click_count += 1
    short.last_clicked_at = now
    db.commit()


def list_shorts(db: Session) -> list[Short]:
    return db.query(Short).order_by(Short.created_at.desc()).all()


def _date_bounds(
    date_from: date | None,
    date_to: date | None,
) -> tuple[datetime | None, datetime | None]:
    start = None
    end = None
    if date_from:
        start = datetime.combine(date_from, datetime.min.time(), tzinfo=UTC)
    if date_to:
        end = datetime.combine(
            date_to + timedelta(days=1),
            datetime.min.time(),
            tzinfo=UTC,
        )
    return start, end


def get_clicks_today(db: Session) -> int:
    today_start = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
    return (
        db.query(func.count(ClickEvent.id))
        .filter(ClickEvent.clicked_at >= today_start)
        .scalar()
        or 0
    )


def get_daily_clicks(
    db: Session,
    days: int = 30,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[tuple[date, int]]:
    if date_from and date_to:
        start = datetime.combine(date_from, datetime.min.time(), tzinfo=UTC)
        end = datetime.combine(
            date_to + timedelta(days=1),
            datetime.min.time(),
            tzinfo=UTC,
        )
        day_count = (date_to - date_from).days + 1
    else:
        today = datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
        start = today - timedelta(days=days - 1)
        end = today + timedelta(days=1)
        day_count = days

    rows = (
        db.query(
            func.date(ClickEvent.clicked_at).label("day"),
            func.count(ClickEvent.id).label("clicks"),
        )
        .filter(ClickEvent.clicked_at >= start, ClickEvent.clicked_at < end)
        .group_by(func.date(ClickEvent.clicked_at))
        .order_by(func.date(ClickEvent.clicked_at))
        .all()
    )

    clicks_by_day = {row.day: row.clicks for row in rows}
    result: list[tuple[date, int]] = []
    for i in range(day_count):
        day = (start + timedelta(days=i)).date()
        result.append((day, clicks_by_day.get(day, 0)))
    return result


def get_top_links(
    db: Session,
    limit: int = 5,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[tuple[Short, int]]:
    start, end = _date_bounds(date_from, date_to)
    if start is None and end is None:
        shorts = (
            db.query(Short)
            .order_by(Short.click_count.desc(), Short.created_at.desc())
            .limit(limit)
            .all()
        )
        return [(s, s.click_count) for s in shorts if s.click_count > 0]

    query = (
        db.query(Short, func.count(ClickEvent.id).label("clicks"))
        .join(ClickEvent, ClickEvent.secret_key == Short.secret_key)
        .group_by(Short.id)
    )
    if start:
        query = query.filter(ClickEvent.clicked_at >= start)
    if end:
        query = query.filter(ClickEvent.clicked_at < end)

    rows = (
        query.order_by(func.count(ClickEvent.id).desc()).limit(limit).all()
    )
    return [(short, int(clicks)) for short, clicks in rows if clicks > 0]


def get_top_referrers(
    db: Session,
    limit: int = 5,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[tuple[str, int]]:
    start, end = _date_bounds(date_from, date_to)
    query = db.query(
        ClickEvent.referrer,
        func.count(ClickEvent.id).label("clicks"),
    ).filter(ClickEvent.referrer.isnot(None), ClickEvent.referrer != "")

    if start:
        query = query.filter(ClickEvent.clicked_at >= start)
    if end:
        query = query.filter(ClickEvent.clicked_at < end)

    rows = (
        query.group_by(ClickEvent.referrer)
        .order_by(func.count(ClickEvent.id).desc())
        .limit(limit)
        .all()
    )
    return [(row.referrer or "Direct", int(row.clicks)) for row in rows]


def get_stats_summary(
    db: Session,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
) -> dict:
    total_links = db.query(func.count(Short.id)).scalar() or 0
    start, end = _date_bounds(date_from, date_to)

    if start is None and end is None:
        total_clicks = (
            db.query(func.coalesce(func.sum(Short.click_count), 0)).scalar() or 0
        )
        clicks_today = get_clicks_today(db)
        top = get_top_links(db, limit=1)
        top_link = top[0][0] if top else None
        top_clicks = top[0][1] if top else 0
    else:
        click_query = db.query(func.count(ClickEvent.id))
        if start:
            click_query = click_query.filter(ClickEvent.clicked_at >= start)
        if end:
            click_query = click_query.filter(ClickEvent.clicked_at < end)
        total_clicks = click_query.scalar() or 0
        clicks_today = get_clicks_today(db) if not date_from and not date_to else 0
        top = get_top_links(db, limit=1, date_from=date_from, date_to=date_to)
        top_link = top[0][0] if top else None
        top_clicks = top[0][1] if top else 0

    return {
        "total_links": total_links,
        "total_clicks": int(total_clicks),
        "clicks_today": clicks_today,
        "top_link": top_link,
        "top_link_clicks": top_clicks,
    }
