from sqlalchemy.orm import Session

from . import keygen
from .models import Short


def key_exists_by_id(db: Session, key: str) -> bool:
    return db.query(Short).filter(Short.id == key).first() is not None


def _create_unique_id(db: Session) -> str:
    key = keygen.create_random_key()
    while key_exists_by_id(db, key):
        key = keygen.create_random_key()
    return key


def create_url(db: Session, url: str) -> str:
    existing = secret_key_from_existing_url(db, url)
    if existing:
        return existing

    key = _create_unique_id(db)
    secret_key = f"{key}_{keygen.create_random_key(length=8)}"

    db.add(Short(id=key, secret_key=secret_key, original_url=url))
    db.commit()

    return secret_key


def get_url_by_key(db: Session, url_key: str) -> str | None:
    short = db.query(Short).filter(Short.secret_key == url_key).first()
    if short:
        return short.original_url
    return None


def secret_key_from_existing_url(db: Session, url: str) -> str | None:
    short = db.query(Short).filter(Short.original_url == url).first()
    if short:
        return short.secret_key
    return None
