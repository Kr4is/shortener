def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_redirect_url(client):
    create_response = client.post(
        "/api/url",
        json={"url": "https://example.com/page"},
    )
    assert create_response.status_code == 200
    secret_key = create_response.json()
    assert isinstance(secret_key, str)

    redirect_response = client.get(f"/s/{secret_key}", follow_redirects=False)
    assert redirect_response.status_code == 307
    assert redirect_response.headers["location"] == "https://example.com/page"


def test_duplicate_url_returns_same_key(client):
    url = "https://example.com/duplicate"
    first = client.post("/api/url", json={"url": url}).json()
    second = client.post("/api/url", json={"url": url}).json()
    assert first == second


def test_invalid_url_returns_400(client):
    response = client.post("/api/url", json={"url": "not-a-valid-url"})
    assert response.status_code == 400
    assert "not valid" in response.json()["detail"].lower()


def test_unknown_short_url_returns_404(client):
    response = client.get("/s/UNKNOWN_KEY")
    assert response.status_code == 404
