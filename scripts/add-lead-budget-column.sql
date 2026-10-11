-- The advisory qualifier's budget question — its last step and its real gate.
--
-- Null on every other funnel: the demo qualifier and the site-wide booking
-- modal have no budget question, and both write null explicitly.
--
-- Run against the branch Vercel's production DATABASE_URL points at
-- (endpoint ep-orange-boat-ahqbz6yx), and against your local dev branch.
-- Idempotent.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget TEXT;
