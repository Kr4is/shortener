import validators

from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from . import crud

app = FastAPI()


def raise_bad_request(message):
    raise HTTPException(status_code=400, detail=message)


def raise_not_found(url):
    message = f"URL '{url}' doesn't exist"
    raise HTTPException(status_code=404, detail=message)


@app.get("/api/python")
def read_root():
    return "Welcome to the URL shortener API :)"


@app.post("/url")
def create_url(url: str):
    if not validators.url(url):
        raise_bad_request(message="Your provided URL is not valid")

    db_url = crud.create_url(url=url)

    return db_url


@app.get("/{url_key}")
def forward_to_target_url(url_key: str):
    if original_url := crud.get_url_by_key(url_key=url_key):
        return RedirectResponse(original_url)
    else:
        raise_not_found(url_key)
