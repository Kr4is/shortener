CREATE TABLE shorts (
    id           VARCHAR(16) PRIMARY KEY,
    secret_key   VARCHAR(32) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_shorts_original_url ON shorts (original_url);
