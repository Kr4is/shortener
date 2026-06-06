import validators
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from . import crud
from .database import check_database_connection, get_db
from .models import Url

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


@app.post("/api/url")
def create_url(url: Url, db: Session = Depends(get_db)):
    requested_url = url.model_dump()["url"]

    if not validators.url(requested_url):
        raise_bad_request(message="Your provided URL is not valid")

    return crud.create_url(db=db, url=requested_url)


@app.get("/s/{url_key}")
def forward_to_target_url(url_key: str, db: Session = Depends(get_db)):
    if original_url := crud.get_url_by_key(db=db, url_key=url_key):
        return RedirectResponse(original_url)
    raise_not_found(url_key)
