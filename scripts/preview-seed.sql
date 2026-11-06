-- Demo data for PR previews only (Dockerfile.preview). Synthetic links and clicks.
INSERT INTO shorts (id, secret_key, original_url, custom_slug, created_at, expires_at) VALUES
  ('DEMO1', 'DEMO1_K5DRBRR4', 'https://www.meetup.com/atlantic-community/events/30123456/', 'meetup-nov', now() - interval '8 days', now() + interval '6 days'),
  ('DEMO2', 'DEMO2_7BLYYG7U', 'https://github.com/pbakaus/impeccable', 'impeccable', now() - interval '18 days', NULL),
  ('DEMO3', 'DEMO3_P0Q9X2LM', 'https://www.postgresql.org/docs/16/release-16.html', 'pg16-notes', now() - interval '14 days', NULL),
  ('DEMO4', 'DEMO4_7V0Z7VE5', 'https://fastapi.tiangolo.com/tutorial/dependencies/', NULL, now() - interval '11 days', NULL),
  ('DEMO5', 'DEMO5_LR81IEK5', 'https://news.ycombinator.com/item?id=41234567', NULL, now() - interval '19 days', NULL),
  ('DEMO6', 'DEMO6_Q3N8D1ZA', 'https://docs.google.com/forms/d/e/1FAIpQLSf-demo-form/viewform', 'cfp-2027', now() - interval '26 days', now() + interval '60 days'),
  ('DEMO7', 'DEMO7_TT7USRYW', 'https://example.com/old-campaign', NULL, now() - interval '40 days', now() - interval '2 days');

INSERT INTO click_events (secret_key, clicked_at, referrer, user_agent)
SELECT s.secret_key,
       now() - (random() * random() * 28) * interval '1 day',
       (ARRAY['https://t.co/', 'https://www.linkedin.com/', 'https://news.ycombinator.com/',
              NULL, NULL, 'https://bsky.app/', 'https://web.telegram.org/'])[1 + floor(random() * 7)],
       'Mozilla/5.0 (demo)'
FROM shorts s
CROSS JOIN LATERAL generate_series(1, CASE s.id
  WHEN 'DEMO1' THEN 140 WHEN 'DEMO2' THEN 90 WHEN 'DEMO3' THEN 31
  WHEN 'DEMO4' THEN 18 WHEN 'DEMO5' THEN 18 WHEN 'DEMO6' THEN 12 ELSE 0 END) AS g;

UPDATE shorts s
SET click_count = c.n, last_clicked_at = c.last
FROM (SELECT secret_key, count(*) AS n, max(clicked_at) AS last
      FROM click_events GROUP BY secret_key) c
WHERE c.secret_key = s.secret_key;
