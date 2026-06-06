from datetime import UTC, datetime, timedelta


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def _create(
    client,
    url: str,
    alias: str | None = None,
    expires_in_days: int | None = None,
) -> str:
    payload: dict = {"url": url}
    if alias:
        payload["alias"] = alias
    if expires_in_days:
        payload["expires_in_days"] = expires_in_days
    return client.post("/api/url", json=payload).json()["public_slug"]


def test_create_and_redirect_url(client):
    slug = _create(client, "https://example.com/page")
    assert isinstance(slug, str)

    redirect_response = client.get(f"/s/{slug}", follow_redirects=False)
    assert redirect_response.status_code == 307
    assert redirect_response.headers["location"] == "https://example.com/page"


def test_redirect_records_click(client):
    slug = _create(client, "https://example.com/click-test")

    client.get(f"/s/{slug}", follow_redirects=False)
    client.get(
        f"/s/{slug}",
        follow_redirects=False,
        headers={"Referer": "https://google.com", "User-Agent": "TestAgent/1.0"},
    )

    urls = client.get("/api/urls").json()
    match = next(u for u in urls if u["public_slug"] == slug)
    assert match["click_count"] == 2


def test_stats_endpoint(client):
    slug = _create(client, "https://example.com/stats-test")
    client.get(f"/s/{slug}", follow_redirects=False)

    stats = client.get("/api/stats").json()
    assert stats["summary"]["total_links"] >= 1
    assert stats["summary"]["total_clicks"] >= 1
    assert "daily_clicks" in stats
    assert "top_referrers" in stats
    assert len(stats["daily_clicks"]) == 30


def test_stats_with_date_range(client):
    slug = _create(client, "https://example.com/range-test")
    client.get(f"/s/{slug}", follow_redirects=False)

    today = datetime.now(UTC).date().isoformat()
    stats = client.get(f"/api/stats?from={today}&to={today}").json()
    assert stats["summary"]["total_clicks"] >= 1
    assert len(stats["daily_clicks"]) == 1


def test_list_urls_endpoint(client):
    _create(client, "https://example.com/list-test")
    response = client.get("/api/urls")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "original_url" in data[0]
    assert "click_count" in data[0]
    assert "public_slug" in data[0]
    assert "custom_slug" in data[0]
    assert "expires_at" in data[0]
    assert "is_expired" in data[0]


def test_export_urls_csv(client):
    _create(client, "https://example.com/export-test")
    response = client.get("/api/urls/export")
    assert response.status_code == 200
    assert "text/csv" in response.headers["content-type"]
    body = response.text
    assert "public_slug" in body
    assert "https://example.com/export-test" in body


def test_create_with_custom_alias(client):
    slug = _create(client, "https://example.com/alias-test", alias="my-link")
    assert slug == "my-link"

    redirect = client.get("/s/my-link", follow_redirects=False)
    assert redirect.status_code == 307
    assert redirect.headers["location"] == "https://example.com/alias-test"


def test_duplicate_alias_returns_409(client):
    _create(client, "https://example.com/first", alias="taken-slug")
    response = client.post(
        "/api/url",
        json={"url": "https://example.com/second", "alias": "taken-slug"},
    )
    assert response.status_code == 409


def test_invalid_alias_returns_400(client):
    response = client.post(
        "/api/url",
        json={"url": "https://example.com/bad", "alias": "api"},
    )
    assert response.status_code == 400

    response = client.post(
        "/api/url",
        json={"url": "https://example.com/bad2", "alias": "ab"},
    )
    assert response.status_code == 400


def test_delete_url(client):
    slug = _create(client, "https://example.com/delete-me")
    delete_response = client.delete(f"/api/urls/{slug}")
    assert delete_response.status_code == 200

    redirect = client.get(f"/s/{slug}", follow_redirects=False)
    assert redirect.status_code == 404
    assert "text/html" in redirect.headers["content-type"]


def test_expired_link_returns_410(client, db_session):
    from api.crud import create_url
    from api.models import Short

    slug = create_url(db_session, "https://example.com/expired")
    short = (
        db_session.query(Short)
        .filter(Short.original_url == "https://example.com/expired")
        .one()
    )
    short.expires_at = datetime.now(UTC) - timedelta(days=1)
    db_session.commit()

    response = client.get(f"/s/{slug}", follow_redirects=False)
    assert response.status_code == 410
    assert "text/html" in response.headers["content-type"]


def test_create_with_expiration(client):
    slug = _create(client, "https://example.com/expires", expires_in_days=7)
    urls = client.get("/api/urls").json()
    match = next(u for u in urls if u["public_slug"] == slug)
    assert match["expires_at"] is not None
    assert match["is_expired"] is False


def test_preview_endpoint(client):
    response = client.get("/api/preview", params={"url": "not-valid"})
    assert response.status_code == 400


def test_duplicate_url_returns_same_key(client):
    url = "https://example.com/duplicate"
    first = _create(client, url)
    second = _create(client, url)
    assert first == second


def test_invalid_url_returns_400(client):
    response = client.post("/api/url", json={"url": "not-a-valid-url"})
    assert response.status_code == 400
    assert "not valid" in response.json()["detail"].lower()


def test_unknown_short_url_returns_404(client):
    response = client.get("/s/UNKNOWN_KEY")
    assert response.status_code == 404
    assert "text/html" in response.headers["content-type"]


def test_api_key_required_when_configured(client, monkeypatch):
    monkeypatch.setenv("ADMIN_API_KEY", "secret-key")
    from api import auth

    auth.ADMIN_API_KEY = "secret-key"

    response = client.post(
        "/api/url",
        json={"url": "https://example.com/protected"},
    )
    assert response.status_code == 401

    response = client.post(
        "/api/url",
        json={"url": "https://example.com/protected"},
        headers={"X-API-Key": "secret-key"},
    )
    assert response.status_code == 200

    auth.ADMIN_API_KEY = None
