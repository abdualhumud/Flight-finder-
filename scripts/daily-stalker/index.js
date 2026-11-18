#!/usr/bin/env node
/**
 * Daily Flight Stalker — scans the destination whitelist from Riyadh and emails a report.
 *
 *   node index.js                 full run (search + email)
 *   DRY_RUN=true node index.js    search only; writes report.html next to this file
 */

import { writeFileSync } from 'node:fs';
import { ORIGIN, DESTINATIONS } from './destinations.js';
import { searchAllDestinations, getRunStats } from './searcher.js';
import { buildEmailHTML, formatDuration } from './emailTemplate.js';
import { createMailer, sendReport } from './mailer.js';

const toInt = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; };

const MIN = toInt(process.env.SEARCH_DAYS_MIN, 30);
const MAX = Math.max(toInt(process.env.SEARCH_DAYS_MAX, 60), MIN);
const SAMPLES = toInt(process.env.SAMPLE_DATES, 3);
const DRY_RUN = process.env.DRY_RUN === 'true';

const isoDay = (offset) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().split('T')[0];
};

/** Evenly spread SAMPLES dates across [MIN, MAX] days from today. */
function sampleDates() {
  if (SAMPLES === 1) return [isoDay(Math.round((MIN + MAX) / 2))];
  return [...new Set(Array.from({ length: SAMPLES }, (_, i) => isoDay(Math.round(MIN + (i * (MAX - MIN)) / (SAMPLES - 1)))))];
}

function printSummary(results) {
  const rows = results.map(r => ({
    Destination: r.destination.name,
    Price: r.cheapest ? `SAR ${Math.round(r.cheapest.price)}${r.simulated ? ' (est)' : ''}` : '—',
    Provider: r.cheapest?.source ?? '—',
    Airline: r.cheapest?.airline ?? '—',
    Duration: r.cheapest ? formatDuration(r.cheapest.duration) : '—',
    Date: r.cheapest ? r.bestDate : '—',
    Errors: r.errors.length || '',
  }));
  rows.sort((a, b) => (parseInt(a.Price.replace(/\D/g, '')) || 1e9) - (parseInt(b.Price.replace(/\D/g, '')) || 1e9));
  console.table(rows);
}

async function main() {
  const t0 = Date.now();
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dates = sampleDates();
  const window = { from: isoDay(MIN), to: isoDay(MAX) };

  const have = [
    process.env.RAPIDAPI_KEY && 'Skyscanner',
    process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET && 'Amadeus',
  ].filter(Boolean);

  console.log(`\n🔍 Daily Flight Stalker — ${dateStr}`);
  console.log(`   ${ORIGIN.name} → ${DESTINATIONS.length} destinations | window ${window.from} … ${window.to} | sampled dates: ${dates.join(', ')}`);
  console.log(`   Live sources configured: ${have.join(', ') || 'NONE'}${process.env.ALLOW_SIMULATION === 'true' ? ' (+ simulation enabled)' : ''}`);
  if (!have.length && process.env.ALLOW_SIMULATION !== 'true') {
    console.warn('   ⚠️  No price API keys set — the report will contain booking links only. Set RAPIDAPI_KEY and/or AMADEUS_API_KEY/SECRET.');
  }

  const results = await searchAllDestinations(ORIGIN, DESTINATIONS, dates, window);
  const stats = getRunStats();

  console.log(`\n✅ Search finished in ${((Date.now() - t0) / 1000).toFixed(1)}s — API calls: Skyscanner ${stats.skyCalls}, Amadeus ${stats.amaCalls}`);
  printSummary(results);

  const errors = results.flatMap(r => r.errors.map(e => `${r.destination.code}: ${e}`));
  if (errors.length) {
    console.warn(`\n⚠️  ${errors.length} source error(s):`);
    [...new Set(errors)].slice(0, 20).forEach(e => console.warn(`   - ${e}`));
  }

  const html = buildEmailHTML(results, dateStr, stats);

  if (DRY_RUN) {
    const out = new URL('./report.html', import.meta.url);
    writeFileSync(out, html);
    console.log(`\n📄 DRY RUN — report written to ${out.pathname} (no email sent)`);
    return;
  }

  const transporter = createMailer();
  if (!transporter) {
    console.error('\n❌ Email not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS (see .env.example).');
    process.exit(1);
  }

  const anySimulated = results.some(r => r.simulated);
  const noLive = results.every(r => !r.cheapest || r.simulated);
  const tag = noLive ? (anySimulated ? '[ESTIMATES] ' : '[NO LIVE DATA] ') : '';
  const to = process.env.EMAIL_TO || 'alhumudab@gmail.com';
  const subject = `${tag}✈️ Your Daily Flight Intelligence Report - ${new Date().toISOString().split('T')[0]}`;

  console.log(`\n📧 Sending report to ${to}…`);
  const id = await sendReport({ transporter, to, subject, html });
  console.log(`✅ Email sent (${id})`);
}

main().catch(e => {
  console.error('💥 Fatal:', e.message);
  process.exit(1);
});
