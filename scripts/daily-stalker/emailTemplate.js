/**
 * Mobile-responsive HTML report. Light theme (renders consistently in Gmail dark mode too).
 * Columns: Destination | Lowest Price | Provider | Flight Duration | Link to Book
 */

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const formatPrice = (n) => `SAR ${Math.round(n).toLocaleString('en-US')}`;

/** Same formula as the web app: (comfort + loyalty/100) / (price * hours). Higher = better value. */
export function valueScore({ price, duration, stops }) {
  if (!price || !duration) return 0;
  const comfort = Math.max(7 - stops, 1);
  const loyalty = Math.round(price * 0.6);
  return Math.round(((comfort + loyalty / 100) / (price * (duration / 60))) * 10000) / 100;
}

const stopsLabel = (s) => (s === 0 ? 'Direct' : `${s} stop${s > 1 ? 's' : ''}`);

export function buildEmailHTML(results, dateStr, stats = {}) {
  const priced = results.filter(r => r.cheapest);
  const liveOnly = priced.filter(r => !r.simulated);
  const allSimulated = priced.length > 0 && liveOnly.length === 0;
  const unpriced = results.filter(r => !r.cheapest);

  // Top 3 by Value Score — never from estimates when real fares exist
  const pool = liveOnly.length ? liveOnly : priced;
  const top3 = [...pool].sort((a, b) => valueScore(b.cheapest) - valueScore(a.cheapest)).slice(0, 3);
  const top3Set = new Set(top3.map(r => r.destination.code));
  const medals = ['🥇', '🥈', '🥉'];

  const board = [...priced].sort((a, b) => a.cheapest.price - b.cheapest.price);

  const th = 'padding:8px 6px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #e5e7eb;';
  const rows = [...board, ...unpriced].map(r => {
    const c = r.cheapest;
    const isTop = top3Set.has(r.destination.code);
    const rank = top3.findIndex(t => t.destination.code === r.destination.code);
    const w = isTop ? 'font-weight:700;' : '';
    const bg = isTop ? 'background:#ecfdf5;' : '';
    const est = r.simulated ? ' <span style="background:#fef3c7;color:#92400e;font-size:10px;padding:1px 5px;border-radius:8px;">ESTIMATE</span>' : '';
    const warn = r.flags?.length ? `<div style="font-size:11px;color:#b45309;font-weight:400;margin-top:3px;">⚠️ ${esc(r.flags[0])}</div>` : '';
    const name = `${isTop ? medals[rank] + ' ' : ''}${esc(r.destination.name)}`;
    const sub = `<div style="font-size:11px;color:#6b7280;font-weight:400;">${esc(r.destination.country)}${c ? ` · ${esc(r.bestDate)}` : ''}</div>`;

    if (!c) {
      return `<tr style="border-bottom:1px solid #e5e7eb;">
        <td style="padding:10px 6px;">${name}${sub}</td>
        <td colspan="3" style="padding:10px 6px;color:#9ca3af;font-size:12px;">No live fare returned — check manually</td>
        <td style="padding:10px 6px;"><a href="${esc(r.link.url)}" style="color:#0369a1;">${esc(r.link.label)}</a></td></tr>`;
    }
    return `<tr style="border-bottom:1px solid #e5e7eb;${bg}${w}">
      <td style="padding:10px 6px;">${name}${sub}${warn}</td>
      <td style="padding:10px 6px;white-space:nowrap;color:#047857;">${formatPrice(c.price)}${est}</td>
      <td style="padding:10px 6px;">${esc(c.source)}<div style="font-size:11px;color:#6b7280;font-weight:400;">${esc(c.airline)}</div></td>
      <td style="padding:10px 6px;white-space:nowrap;">${formatDuration(c.duration)}<div style="font-size:11px;color:#6b7280;font-weight:400;">${stopsLabel(c.stops)}</div></td>
      <td style="padding:10px 6px;"><a href="${esc(r.link.url)}" style="display:inline-block;background:#0284c7;color:#ffffff;text-decoration:none;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:600;">Book</a></td>
    </tr>`;
  }).join('');

  const podium = top3.map((r, i) => `<td style="width:33%;padding:10px 6px;text-align:center;background:#ecfdf5;border-radius:8px;">
      <div style="font-size:22px;">${medals[i]}</div>
      <div style="font-size:13px;font-weight:700;color:#111827;">${esc(r.destination.name)}</div>
      <div style="font-size:15px;font-weight:700;color:#047857;">${formatPrice(r.cheapest.price)}</div>
      <div style="font-size:11px;color:#6b7280;">${formatDuration(r.cheapest.duration)} · ${stopsLabel(r.cheapest.stops)}</div>
    </td>`).join('<td style="width:6px;"></td>');

  const banners = [];
  if (allSimulated) banners.push('⚠️ <b>No live price source returned data.</b> Every price below is a simulated ESTIMATE, not a real fare. Verify with the booking links.');
  if (!priced.length) banners.push('⚠️ <b>No live fares were found today.</b> Check the API keys / quota in the GitHub Actions log. Use the links to search manually.');
  if (stats.skyBudgetHit) banners.push('ℹ️ Skyscanner daily call budget was reached — some dates were not scanned. Raise <code>SKYSCANNER_MAX_CALLS</code> if your plan allows.');
  if (stats.idsUnverified?.length) banners.push(`ℹ️ Could not verify Skyscanner IDs for: ${esc(stats.idsUnverified.join(', '))} (used built-in IDs).`);
  const errorList = [...new Set(results.flatMap(r => r.errors || []))].slice(0, 6);
  if (errorList.length) banners.push(`ℹ️ ${errorList.length}+ source error(s) today, e.g. <i>${esc(errorList[0])}</i>`);

  const bannerHtml = banners.map(b => `<div style="margin:0 0 10px;padding:10px 12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#92400e;">${b}</div>`).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Daily Flight Intelligence Report</title>
<style>@media only screen and (max-width:480px){.wrap{padding:8px !important}td,th{font-size:12px !important}}</style></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#111827;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;"><tr><td align="center" class="wrap" style="padding:20px 12px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;">
  <tr><td style="padding:22px 20px;background:#0369a1;color:#ffffff;text-align:center;">
    <div style="font-size:22px;font-weight:700;">✈️ Daily Flight Intelligence</div>
    <div style="font-size:13px;margin-top:4px;opacity:.9;">${esc(dateStr)} · From Riyadh (RUH) · ${results.length} destinations · one-way, next 30–60 days</div>
  </td></tr>
  <tr><td style="padding:16px 20px 0;">${bannerHtml}</td></tr>
  ${top3.length ? `<tr><td style="padding:8px 20px 4px;">
    <div style="font-size:14px;font-weight:700;margin-bottom:8px;">🏆 Top 3 Deals of the Day <span style="font-weight:400;color:#6b7280;font-size:11px;">(highest Value Score)</span></div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>${podium}</tr></table></td></tr>` : ''}
  <tr><td style="padding:14px 14px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
      <tr><th style="${th}">Destination</th><th style="${th}">Lowest Price</th><th style="${th}">Provider</th><th style="${th}">Duration</th><th style="${th}">Book</th></tr>
      ${rows}
    </table>
  </td></tr>
  <tr><td style="padding:16px 20px;background:#f9fafb;text-align:center;font-size:11px;color:#6b7280;line-height:1.6;">
    Prices are one-way economy per adult in SAR at the time of search and can change quickly — always confirm on the booking site.<br>
    Google Flights / Trip.com have no public price API, so they are provided as search links only.<br>
    <a href="https://abdualhumud.github.io/Flight-finder-/" style="color:#0369a1;">Open Flight Finder dashboard</a>
  </td></tr>
</table></td></tr></table></body></html>`;
}
