#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Test Meta Conversions API Lifecycle Endpoints
# ──────────────────────────────────────────────────────────────────────────────
#
# Usage:
#   1. Set your env vars (or edit the defaults below)
#   2. Make sure the dev server is running: npm run dev
#   3. Run: bash scripts/test-capi.sh
#
# Prerequisites:
#   - A lead must already exist in the DB (submit a form first)
#   - CRM_WEBHOOK_SECRET must be set in .env.local
# ──────────────────────────────────────────────────────────────────────────────

BASE_URL="${BASE_URL:-http://localhost:3000}"
SECRET="${CRM_WEBHOOK_SECRET:-your-secret-here}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"

echo "=== Testing Meta Lifecycle Endpoints ==="
echo "Base URL: $BASE_URL"
echo "Email:    $TEST_EMAIL"
echo ""

# 1. Qualified Lead
echo "--- POST /api/meta/qualified-lead ---"
curl -s -X POST "$BASE_URL/api/meta/qualified-lead" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d "{\"email\": \"$TEST_EMAIL\"}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 2. Booked Call
echo "--- POST /api/meta/booked-call ---"
curl -s -X POST "$BASE_URL/api/meta/booked-call" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d "{\"email\": \"$TEST_EMAIL\"}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 3. Showed Call
echo "--- POST /api/meta/showed-call ---"
curl -s -X POST "$BASE_URL/api/meta/showed-call" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d "{\"email\": \"$TEST_EMAIL\"}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 4. Opportunity
echo "--- POST /api/meta/opportunity ---"
curl -s -X POST "$BASE_URL/api/meta/opportunity" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d "{\"email\": \"$TEST_EMAIL\"}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 5. Purchase (with value)
echo "--- POST /api/meta/purchase ---"
curl -s -X POST "$BASE_URL/api/meta/purchase" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $SECRET" \
  -d "{\"email\": \"$TEST_EMAIL\", \"value\": 5000, \"currency\": \"USD\"}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

# 6. Test 401 — wrong secret
echo "--- Test 401 (wrong secret) ---"
curl -s -X POST "$BASE_URL/api/meta/booked-call" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: wrong-secret" \
  -d "{\"email\": \"$TEST_EMAIL\"}" | python3 -m json.tool 2>/dev/null || echo "(raw response above)"
echo ""

echo "=== Done ==="
