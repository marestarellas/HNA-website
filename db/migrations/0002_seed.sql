-- Optional seed data so the map feels alive on first load.
-- Safe to skip in production by not applying this migration.
-- Pre-approved (status='approved') so they show without moderation.

INSERT OR IGNORE INTO stories
  (id, created_at, lat, lng, text, source, age_band, gender,
   connection_types, connection_subject, pheno, status, consent_version, lang)
VALUES
  ('seed-jp-cherry', 1735689600000, 35.0, 135.7,
   'Every spring a single cherry tree outside my window taught me how to let go.',
   'typed', '25–34', 'woman',
   '["plant"]', 'cherry tree', '{"awe":3,"unity":2,"timelessness":3}',
   'approved', 'seed', 'en'),
  ('seed-ak-raven', 1735689600000, 61.2, -149.9,
   'A raven followed me for three winters. We had an understanding I cant explain.',
   'typed', '45–54', 'woman',
   '["animal"]', 'raven', '{"awe":3,"vividness":4,"warmth":3}',
   'approved', 'seed', 'en'),
  ('seed-br-rainforest', 1735689600000, -3.1, -60.0,
   'The forest breathes back. I have never felt so small and so held at once.',
   'typed', '18–24', 'non-binary',
   '["environment","plant"]', 'rainforest', '{"awe":4,"unity":4,"timelessness":3}',
   'approved', 'seed', 'en'),
  ('seed-np-mountain', 1735689600000, 27.9, 86.9,
   'The mountain does not care that you came. That indifference healed something in me.',
   'typed', '55–64', 'man',
   '["environment"]', 'mountain', '{"awe":4,"unity":2,"timelessness":4}',
   'approved', 'seed', 'en'),
  ('seed-gb-oak', 1735689600000, 51.5, -0.12,
   'An oak in the park has watched me through every version of myself.',
   'voice', '25–34', 'woman',
   '["plant"]', 'oak tree', '{"warmth":4,"timelessness":4,"vividness":2}',
   'approved', 'seed', 'en'),
  ('seed-nz-whale', 1735689600000, -41.3, 174.8,
   'We heard a whale through the hull. The whole boat went silent, like a held breath.',
   'typed', '35–44', 'woman',
   '["animal"]', 'whale', '{"awe":4,"unity":3,"vividness":4}',
   'approved', 'seed', 'en'),
  ('seed-is-aurora', 1735689600000, 64.1, -21.9,
   'Under the aurora I forgot my own name for a while. It was a relief.',
   'typed', '45–54', 'man',
   '["environment"]', 'aurora', '{"awe":4,"unity":4,"timelessness":3}',
   'approved', 'seed', 'en');
