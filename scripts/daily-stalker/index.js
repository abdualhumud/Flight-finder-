#!/usr/bin/env node

/**
 * Daily Flight Stalker — Autonomous Agent
 *
 * Scans 15 destinations from Riyadh, finds the cheapest fares across
 * Skyscanner + Amadeus + simulation, and emails an intelligence report.
 *
 * Usage:
 *   node index.js              # Full run (search + email)
 *   DRY_RUN=true node index.js # Search only, print to console
 */

import { ORIGIN, DESTINATIONS } from './destinations.js';
import { searchAllDestinations } from './searcher.js';
import { buildEmailHTML } from './emailTemplate.js';
import { createMailer, sendReport } from './mailer.js';

const SEARCH_DAYS_MIN = parseInt(process.env.SEARCH_DAYS_MIN || '30', 10);
const SEARCH_DAYS_MAX = parseInt(process.env.SEARCH_DAYS_MAX || '60', 10);
const DRY_RUN = process.env.DRY_RUN === 'true';

function generateSearchDates() {
  const dates = [];
  const now = new Date();

  for (let offset = SEARCH_DAYS_MIN; offset <= SEARCH_DAYS_MAX; offset += 5) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    dates.push(d.toISOString().split('T')[0]);
  }

  return dates;
}

function printSummary(results) {
  const sorted = [...results]
    .filter(r => r.cheapest)
    .sort((a, b) => a.cheapest.price - b.cheapest.price);

  console.log('\n┌─────────────────────────────────────────────────────────────────┐');
  console.log('│  ✈️  DAILY FLIGHT INTELLIGENCE REPORT                          │');
  console.log('├──────────────────────┬──────────┬─────────┬──────┬─────────────┤');
  console.log('│ Destination          │ Price    │ Airline │ Dur  │ Source      │');
  console.log('├──────────────────────┼──────────┼─────────┼──────┼─────────────┤');

  for (const r of sorted) {
    const c = r.cheapest;
    const dest = `${r.destination.name}`.padEnd(20);
    const price = `SAR ${c.price}`.padEnd(8);
    const airline = c.airline.slice(0, 7).padEnd(7);
    const dur = `${Math.floor(c.duration / 60)}h${c.duration % 60 > 0 ? c.duration % 60 + 'm' : ''}`.padEnd(4);
    const source = c.source.padEnd(11);
    console.log(`│ ${dest} │ ${price} │ ${airline} │ ${dur} │ ${source} │`);
  }

  console.log('└──────────────────────┴──────────┴─────────┴──────┴─────────────┘');

  const failed = results.filter(r => !r.cheapest);
  if (failed.length) {
    console.log(`\n⚠️  No results for: ${failed.map(f => f.destination.name).join(', ')}`);
  }
}

async function main() {
  const startTime = Date.now();
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  console.log(`\n🔍 Daily Flight Stalker — ${dateStr}`);
  console.log(`   Origin: ${ORIGIN.name} (${ORIGIN.code})`);
  console.log(`   Destinations: ${DESTINATIONS.length}`);
  console.log(`   Search window: ${SEARCH_DAYS_MIN}–${SEARCH_DAYS_MAX} days out`);

  // Generate dates to scan (every 5 days within the window)
  const dates = generateSearchDates();
  console.log(`   Scanning ${dates.length} dates per destination...\n`);

  // Search all destinations in parallel
  const results = await searchAllDestinations(ORIGIN, DESTINATIONS, dates);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Search complete in ${elapsed}s`);

  printSummary(results);

  // Build email
  const html = buildEmailHTML(results, dateStr);

  if (DRY_RUN) {
    console.log('\n📧 DRY RUN — Email HTML saved to stdout (pipe to file to preview):');
    console.log('--- EMAIL HTML START ---');
    console.log(html);
    console.log('--- EMAIL HTML END ---');
    return;
  }

  // Send email
  const transporter = createMailer();
  if (!transporter) {
    console.error('\n❌ Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    console.log('   Run with DRY_RUN=true to see the report without sending email.');
    process.exit(1);
  }

  const to = process.env.EMAIL_TO || 'alhumudab@gmail.com';
  const subject = `✈️ Your Daily Flight Intelligence Report - ${new Date().toISOString().split('T')[0]}`;

  try {
    console.log(`\n📧 Sending report to ${to}...`);
    const messageId = await sendReport({ transporter, to, subject, html });
    console.log(`✅ Email sent! Message ID: ${messageId}`);
  } catch (e) {
    console.error(`❌ Failed to send email: ${e.message}`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('💥 Fatal error:', e);
  process.exit(1);
});
