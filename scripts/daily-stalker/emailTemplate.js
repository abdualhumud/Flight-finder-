/**
 * Builds a mobile-responsive HTML email with flight deal results.
 */

function formatDuration(minutes) {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim();
}

function formatPrice(amount) {
  if (!amount && amount !== 0) return '--';
  return `SAR ${amount.toLocaleString('en-SA')}`;
}

function calculateValueScore({ price, duration, stops }) {
  if (!price || !duration) return 0;
  const comfort = 7 - stops;
  const loyaltyPoints = Math.round(price * 0.6);
  const raw = (comfort + loyaltyPoints / 100) / (price * (duration / 60));
  return Math.round(raw * 10000) / 100;
}

function dealRow(result, rank) {
  const { destination, cheapest, bestDate, links } = result;
  if (!cheapest) return '';

  const vs = calculateValueScore(cheapest);
  const isTopDeal = rank <= 3;
  const bgColor = isTopDeal ? '#1a2332' : '#12131a';
  const borderLeft = isTopDeal ? '3px solid #22c55e' : '3px solid #2a2b3a';
  const badge = isTopDeal
    ? `<span style="background:#22c55e20;color:#22c55e;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600;">TOP ${rank}</span>`
    : '';

  const linkButtons = Object.entries(links).map(([name, url]) =>
    `<a href="${url}" style="color:#38bdf8;text-decoration:none;font-size:11px;padding:4px 10px;border:1px solid #2a2b3a;border-radius:6px;display:inline-block;margin:2px;" target="_blank">${name}</a>`
  ).join(' ');

  return `
    <tr>
      <td style="padding:0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};border-left:${borderLeft};margin-bottom:8px;border-radius:8px;">
          <tr>
            <td style="padding:16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="font-size:16px;font-weight:700;color:#ffffff;margin-bottom:2px;">
                      ${destination.name}, ${destination.country} ${badge}
                    </div>
                    <div style="font-size:12px;color:#9ca3af;">
                      RUH → ${destination.code} &nbsp;•&nbsp; ${bestDate}
                    </div>
                  </td>
                  <td style="text-align:right;vertical-align:top;">
                    <div style="font-size:20px;font-weight:700;color:#22c55e;">
                      ${formatPrice(cheapest.price)}
                    </div>
                    <div style="font-size:11px;color:#9ca3af;">via ${cheapest.source}</div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="font-size:12px;color:#d1d5db;">
                    ✈️ ${cheapest.airline}
                  </td>
                  <td style="font-size:12px;color:#d1d5db;text-align:center;">
                    ⏱ ${formatDuration(cheapest.duration)}
                  </td>
                  <td style="font-size:12px;color:#d1d5db;text-align:center;">
                    ${cheapest.stops === 0 ? '🟢 Direct' : `🔶 ${cheapest.stops} stop${cheapest.stops > 1 ? 's' : ''}`}
                  </td>
                  <td style="font-size:12px;color:#d1d5db;text-align:right;">
                    VS: <strong style="color:${vs >= 5 ? '#22c55e' : vs >= 3 ? '#f59e0b' : '#9ca3af'}">${vs.toFixed(1)}</strong>
                  </td>
                </tr>
              </table>

              <div style="margin-top:12px;">
                ${linkButtons}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

export function buildEmailHTML(results, dateStr) {
  const sorted = [...results]
    .filter(r => r.cheapest)
    .sort((a, b) => {
      const vsA = calculateValueScore(a.cheapest);
      const vsB = calculateValueScore(b.cheapest);
      return vsB - vsA;
    });

  const failed = results.filter(r => !r.cheapest);

  const top3 = sorted.slice(0, 3);
  const top3Summary = top3.map((r, i) =>
    `<td style="padding:8px;text-align:center;background:#1a2332;border-radius:8px;width:33%;">
      <div style="font-size:24px;margin-bottom:4px;">${['🥇','🥈','🥉'][i]}</div>
      <div style="font-size:13px;font-weight:700;color:#ffffff;">${r.destination.name}</div>
      <div style="font-size:16px;font-weight:700;color:#22c55e;">${formatPrice(r.cheapest.price)}</div>
      <div style="font-size:10px;color:#9ca3af;">${formatDuration(r.cheapest.duration)} • ${r.cheapest.stops === 0 ? 'Direct' : `${r.cheapest.stops} stop`}</div>
    </td>`
  ).join('<td style="width:8px;"></td>');

  const dealRows = sorted.map((r, i) => dealRow(r, i + 1)).join('');

  const failedSection = failed.length
    ? `<tr><td style="padding:16px 0 0;">
        <div style="font-size:12px;color:#6b7280;">
          ⚠️ No results for: ${failed.map(f => f.destination.name).join(', ')}
        </div>
      </td></tr>`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flight Intelligence Report</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0b10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0b10;">
    <tr>
      <td align="center" style="padding:20px 12px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">

          <!-- Header -->
          <tr>
            <td style="padding:24px 20px;background:linear-gradient(135deg,#0ea5e9 0%,#a855f7 100%);border-radius:12px 12px 0 0;text-align:center;">
              <div style="font-size:28px;margin-bottom:8px;">✈️</div>
              <div style="font-size:20px;font-weight:700;color:#ffffff;">Daily Flight Intelligence</div>
              <div style="font-size:13px;color:#e0f2fe;margin-top:4px;">${dateStr} • Riyadh (RUH) • ${sorted.length} destinations scanned</div>
            </td>
          </tr>

          <!-- Top 3 Podium -->
          <tr>
            <td style="background:#12131a;padding:20px;">
              <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:12px;text-align:center;">🏆 Top 3 Deals of the Day</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>${top3Summary}</tr>
              </table>
            </td>
          </tr>

          <!-- Deals List -->
          <tr>
            <td style="background:#12131a;padding:0 20px 20px;">
              <div style="font-size:14px;font-weight:600;color:#ffffff;margin-bottom:12px;">📊 Full Deal Board</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${dealRows}
                ${failedSection}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px;background:#0d0e14;border-radius:0 0 12px 12px;text-align:center;">
              <div style="font-size:11px;color:#6b7280;line-height:1.6;">
                Generated by <strong style="color:#9ca3af;">Flight Finder — Daily Stalker</strong><br>
                Prices are indicative and may vary. Always verify on the booking platform.<br>
                <a href="https://abdualhumud.github.io/Flight-finder-/" style="color:#38bdf8;text-decoration:none;">Open Flight Finder Dashboard →</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
