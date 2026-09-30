#!/usr/bin/env node
/**
 * Create (or find) the Firm Foundation test product and its two prices in a
 * Stripe TEST account, and print the env lines to paste into .env.local:
 *   - $497/month recurring  → STRIPE_FOUNDATION_PRICE_ID
 *   - $999 one-time setup   → STRIPE_FOUNDATION_SETUP_PRICE_ID
 *
 *   node scripts/demo/create-stripe-test-product.mjs [--env <path>]
 *
 * Idempotent: re-running reuses the product tagged metadata.nexli_product =
 * 'foundation' and any matching active USD price on it. The two lookups can
 * never collide: one requires recurring.interval === 'month', the other
 * requires no `recurring` at all. Refuses to run with a live key.
 */
import { resolve } from 'node:path';
import Stripe from 'stripe';

const PRODUCT_NAME = 'Firm Foundation (test)';
const PRODUCT_TAG = 'foundation';
const UNIT_AMOUNT = 49700; // $497.00
const SETUP_AMOUNT = 99900; // $999.00 one-time setup fee
const CURRENCY = 'usd';
const INTERVAL = 'month';

function fail(message) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  let envPath = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--env') {
      envPath = argv[++i];
      if (!envPath) fail('--env requires a path');
    } else if (a === '-h' || a === '--help') {
      console.error('Usage: node scripts/demo/create-stripe-test-product.mjs [--env <path>]');
      process.exit(1);
    } else {
      fail(`Unknown argument ${a}`);
    }
  }
  return { envPath };
}

async function findProduct(stripe) {
  const found = await stripe.products.search({
    query: `metadata['nexli_product']:'${PRODUCT_TAG}'`,
    limit: 1,
  });
  return found.data[0] ?? null;
}

async function listPrices(stripe, productId) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  return prices.data;
}

function findMonthlyPrice(prices) {
  return (
    prices.find(
      (p) =>
        p.recurring?.interval === INTERVAL &&
        p.unit_amount === UNIT_AMOUNT &&
        p.currency === CURRENCY,
    ) ?? null
  );
}

function findSetupPrice(prices) {
  return (
    prices.find(
      (p) => !p.recurring && p.unit_amount === SETUP_AMOUNT && p.currency === CURRENCY,
    ) ?? null
  );
}

async function main() {
  const { envPath } = parseArgs(process.argv.slice(2));
  if (envPath) {
    try {
      process.loadEnvFile(resolve(process.cwd(), envPath));
    } catch (err) {
      fail(`Could not load env file ${envPath}: ${err.message}`);
    }
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    fail('STRIPE_SECRET_KEY is not set. Put a test key (sk_test_...) in .env.local and pass --env .env.local.');
  }
  if (!key.startsWith('sk_test_')) {
    fail('STRIPE_SECRET_KEY must be a TEST key starting with sk_test_. This script never touches live mode.');
  }

  const stripe = new Stripe(key);

  let product = await findProduct(stripe);
  if (product) {
    console.log(`Found product ${product.id} (${product.name})`);
  } else {
    product = await stripe.products.create({
      name: PRODUCT_NAME,
      metadata: { nexli_product: PRODUCT_TAG },
    });
    console.log(`Created product ${product.id} (${product.name})`);
  }

  const existing = await listPrices(stripe, product.id);

  let price = findMonthlyPrice(existing);
  if (price) {
    console.log(`Found price ${price.id} ($${UNIT_AMOUNT / 100}/${INTERVAL})`);
  } else {
    price = await stripe.prices.create({
      product: product.id,
      currency: CURRENCY,
      unit_amount: UNIT_AMOUNT,
      recurring: { interval: INTERVAL },
      nickname: 'Firm Foundation monthly',
    });
    console.log(`Created price ${price.id} ($${UNIT_AMOUNT / 100}/${INTERVAL})`);
  }

  let setupPrice = findSetupPrice(existing);
  if (setupPrice) {
    console.log(`Found setup price ${setupPrice.id} ($${SETUP_AMOUNT / 100} one-time)`);
  } else {
    setupPrice = await stripe.prices.create({
      product: product.id,
      currency: CURRENCY,
      unit_amount: SETUP_AMOUNT,
      nickname: 'Firm Foundation setup fee (one-time)',
    });
    console.log(`Created setup price ${setupPrice.id} ($${SETUP_AMOUNT / 100} one-time)`);
  }

  console.log('\nAdd to .env.local:');
  console.log(`STRIPE_FOUNDATION_PRICE_ID=${price.id}`);
  console.log(`STRIPE_FOUNDATION_SETUP_PRICE_ID=${setupPrice.id}`);
  console.log(`# product: ${product.id}`);
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
