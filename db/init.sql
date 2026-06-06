CREATE TABLE shorts (
    id               VARCHAR(16) PRIMARY KEY,
    secret_key       VARCHAR(32) NOT NULL UNIQUE,
    original_url     TEXT NOT NULL,
    custom_slug      VARCHAR(32) UNIQUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    click_count      INTEGER NOT NULL DEFAULT 0,
    last_clicked_at  TIMESTAMPTZ,
    expires_at       TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_shorts_original_url ON shorts (original_url);

CREATE TABLE click_events (
    id          BIGSERIAL PRIMARY KEY,
    secret_key  VARCHAR(32) NOT NULL REFERENCES shorts(secret_key) ON DELETE CASCADE,
    clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    referrer    TEXT,
    user_agent  TEXT
);

CREATE INDEX idx_click_events_clicked_at ON click_events (clicked_at);

CREATE TABLE schema_migrations (
    version     TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES
    ('000_schema_migrations'),
    ('001_add_click_tracking'),
    ('002_add_custom_slug'),
    ('003_add_expires_at'),
    ('004_click_metadata')
ON CONFLICT (version) DO NOTHING;
