ALTER TABLE shorts ADD COLUMN IF NOT EXISTS click_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE shorts ADD COLUMN IF NOT EXISTS last_clicked_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS click_events (
    id          BIGSERIAL PRIMARY KEY,
    secret_key  VARCHAR(32) NOT NULL REFERENCES shorts(secret_key) ON DELETE CASCADE,
    clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_click_events_clicked_at ON click_events (clicked_at);
