# CLAUDE.md

This file is guidance for Claude Code (claude.ai/code) when working with this repository.

## Project Overview

**Flight Finder — Travel Arbitrage Engine** is a Next.js 15 dashboard for flight deal intelligence, geo-pricing arbitrage, and travel optimization. It's deployed as a **fully static site** to GitHub Pages and runs entirely in the browser (no backend).

- **Framework**: Next.js 15 App Router (React 19)
- **Styling**: Tailwind CSS v3 with custom dark theme
- **Data**: TanStack Query v5 for all fetching/caching
- **Charts**: Recharts
- **Icons**: lucide-react
- **Deployment**: GitHub Pages via GitHub Actions (`out/` static export)
- **i18n**: Custom EN/AR context with RTL support

## Critical Constraints

### Static export — no server-side code
`next.config.mjs` uses `output: 'export'`. This means:
- **No API routes** (`app/api/*`) — they fail at build time
- **No `force-dynamic`**, no `request.url` access, no `revalidate`
- **No `exportPathMap`** (App Router doesn't support it)
- **Everything runs in the browser** — all API calls go directly from the client
- Images must use `unoptimized: true`

If you need server-like behavior, do it client-side: `fetch` with `no-cors`, iframe probes, localStorage, etc. See `lib/api/priceProbe.js` for the pattern.

### basePath must be respected
`basePath: '/Flight-finder-'` is set for GitHub Pages. Any hardcoded path detection (e.g. `Sidebar.jsx` active link logic) must prefix paths with `/Flight-finder-`.

## Architecture

### File Structure
```
app/
  layout.jsx           # Root shell (Sidebar + StatusBar + main)
  page.jsx             # Mission Control (live deals)
  search/page.jsx      # Hacker Lab (flight search) — most complex page
  arbitrage/page.jsx   # Geo-Pricing (POS comparison)
  tracker/page.jsx     # Price Watchdog (alerts, charts)
  upgrade/page.jsx     # Upgrade Suite (email templates)
  wallet/page.jsx      # Wallet Strategy (credit cards)
  calculator/page.jsx  # True Cost Calculator
  tools/page.jsx       # Hacker Tools (sweet spots, checklist)
  globals.css          # Base styles, .glass, .glow-*, .safe-bottom

components/
  Sidebar.jsx          # Desktop sidebar + mobile bottom nav
  StatusBar.jsx        # Top status bar (desktop only)
  FlightTable.jsx      # Flight results list (dual mobile/desktop layout)
  AirportSearch.jsx    # Airport autocomplete
  GeoProxy.jsx         # POS URL generator
  PriceProbe.jsx       # No-API-key platform prober

lib/
  api/
    flightEngine.js    # Core simulation + multi-source aggregation
    skyscanner.js      # Skyscanner RapidAPI client
    amadeus.js         # Amadeus API client
    deepLinks.js       # Deep-link URL generators (Google/Skyscanner/Kayak/Trip/Momondo)
    priceProbe.js      # Client-side reachability/iframe probing
  hooks/
    useFlightSearch.js # All TanStack Query hooks
  i18n.jsx             # I18nProvider + t() + RTL handling
  providers.jsx        # TanStack QueryClient provider
  utils.js             # formatPrice, formatDuration, calculateValueScore, cn

data/
  airports.js          # 100+ airports with Skyscanner entityIds + airportByCode lookup
  static.js            # Credit cards, upgrade templates, checklist, sweet spots
```

### Data Flow
1. **User input** → `searchParams` state in page component
2. **TanStack Query hook** (`useFlightSearch`, `useGeoArbitrage`, etc.) keyed on `searchParams`
3. **API client** (`flightEngine.searchFlightOffers`) tries live APIs, falls back to simulation
4. **Multi-source aggregation**: flights get tagged with `source: 'skyscanner'|'amadeus'|'google_flights'|'trip_com'|'kayak'|'simulated'`
5. **Value Score** computed: `(comfort + loyaltyPoints/100) / (price * duration/60)`
6. **UI** sorts by value/price/duration

### TanStack Query Defaults
```js
const STALE_TIME = 5 * 60 * 1000;        // 5 min — cached data shown instantly
const REFETCH_INTERVAL = 30 * 60 * 1000; // 30 min — auto background refresh
refetchOnWindowFocus: 'always'           // refresh when tab regains focus
```

## Styling Rules

### Mobile-First (required)
All layouts **must** be mobile-first. Always start with the smallest layout and add `sm:` / `md:` / `lg:` modifiers upward.

**Breakpoints**:
- Default (`<640px`) — mobile: single column, bottom nav visible, touch targets
- `sm:` (`≥640px`) — large phones / small tablets
- `md:` (`≥768px`) — tablet / desktop split; desktop sidebar appears, bottom nav hidden
- `lg:` (`≥1024px`) — full desktop grids

**Common patterns**:
```jsx
// Headers
<h2 className="text-xl md:text-2xl">...</h2>
<div className="w-8 h-8 md:w-10 md:h-10">...</div>
<p className="text-xs md:text-sm ms-11 md:ms-[52px]">...</p>

// Spacing
<div className="space-y-4 md:space-y-6">
<main className="p-3 md:p-6 pb-20 md:pb-6">  {/* pb-20 for bottom nav clearance */}

// Grids
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
<div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">  {/* geo cards */}

// Touch targets — inputs must be py-3 on mobile, py-2.5 on desktop
<input className="py-3 md:py-2.5 ..." />

// Desktop sidebar / mobile bottom nav toggle
<aside className="hidden md:flex ...">        {/* Desktop only */}
<nav className="md:hidden fixed bottom-0 ..."> {/* Mobile only */}

// Dual layouts inside components (FlightTable pattern)
<div className="hidden md:flex ...">   {/* Desktop horizontal */}
<div className="md:hidden space-y-2.5">{/* Mobile vertical stack */}

// Tables → card layouts on mobile (Arbitrage pattern)
<div className="hidden md:block overflow-x-auto"><table>...</table></div>
<div className="md:hidden divide-y">...card rows...</div>

// Horizontal scroll for overflowing tab bars
<div className="flex items-center gap-2 overflow-x-auto">
```

### RTL Support (required)
Arabic uses `dir="rtl"` set on `<html>` by `I18nProvider`. **Never use directional properties** like `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `border-l`, `border-r`. Instead use Tailwind's logical properties:

| Bad           | Good                    |
|---------------|-------------------------|
| `ml-2`        | `ms-2` (margin-start)   |
| `mr-2`        | `me-2` (margin-end)     |
| `pl-2`        | `ps-2` (padding-start)  |
| `pr-2`        | `pe-2` (padding-end)    |
| `left-0`      | `start-0`               |
| `right-0`     | `end-0`                 |
| `border-l`    | `border-s`              |
| `text-left`   | `text-start`            |
| `text-right`  | `text-end`              |

Also prefer `rtl:` / `ltr:` modifiers for conditional styles. The `isRTL` flag is available from `useI18n()` for JS-side logic (e.g., flipping chevrons in Sidebar).

### Custom Color Tokens
Defined in `tailwind.config.js`:
- `brand-400/500/600` — primary blue (Skyscanner-ish)
- `surface` / `surface-elevated` / `surface-hover` — dark backgrounds
- `border-subtle` — subtle divider
- `accent-green` / `accent-red` / `accent-amber` / `accent-purple` / `accent-cyan`

Use `bg-surface-hover`, `border-border-subtle`, `text-accent-green`, etc. Don't reach for raw Tailwind grays beyond `text-gray-{400..700}` for secondary text.

### Component Utilities (`globals.css`)
- `.glass` — frosted backdrop-blur card
- `.glass-hover` — hover state for glass cards
- `.glow-blue` / `.glow-green` / `.glow-red` — subtle colored glow
- `.safe-bottom` — iOS safe-area-inset-bottom padding (mobile bottom nav)
- `animate-slide-up` — fade+translate entry animation

## i18n

`lib/i18n.jsx` exports `I18nProvider`, `useI18n()`, and a `t(key)` function. All user-facing strings must go through `t()`.

- Translations live inline in `lib/i18n.jsx` as `en` / `ar` objects
- `locale` persists to `localStorage` (`'locale'` key)
- `changeLocale('ar')` swaps `<html lang>` and `<html dir>`
- Key naming convention: `section.key` (e.g., `search.origin`, `geo.title`, `flight.errorFare`)

When adding a new user-visible string, add it to **both** `en` and `ar` objects.

## Key Conventions

### Airport data flow
Airport search uses a 3-tier fallback (Skyscanner → Amadeus → static DB). The critical detail: **Skyscanner requires numeric entity IDs, not IATA codes**. The static DB in `data/airports.js` includes real Skyscanner entity IDs, and `airportByCode` is used to enrich Amadeus results. When adding airports, always include `entityId` / `skyId`.

### Flight simulation
`lib/api/flightEngine.js` generates deterministic simulated flights using a seed derived from route + date. Flights are tagged with random source labels from `SIM_SOURCES` so the UI shows visual diversity across "Skyscanner / Amadeus / Google / Trip.com / Kayak". Real API calls are attempted first; simulation is the fallback.

### Geo-pricing (POS markets)
Eight Point-of-Sale markets: `SA, IN, TR, EG, IL, PK, PH, US`. Each has a currency, VPN city, and flag. `GeoProxy.jsx` generates platform-specific URLs with `market` / `currency` / `hl` params and instructs the user to switch VPN + incognito.

### Value Score formula
```js
valueScore = (comfort + loyaltyPoints / 100) / (price * duration / 60)
```
Defined in `lib/utils.js` as `calculateValueScore`. Higher = better. Used as the default sort.

### Date handling
Dates are stored as `YYYY-MM-DD` strings, not `Date` objects. Convert with `.split('T')[0]` or `.toISOString().split('T')[0]`. The flexibility grid has 4 modes: `exact`, `pm3` (±3 days), `month`, `anytime`.

## Common Gotchas

1. **Don't create API routes** — `output: 'export'` will fail the build. If you need "server" behavior, do it client-side.
2. **Don't hardcode paths** — always respect `basePath: '/Flight-finder-'` for active link detection.
3. **Don't use `ml-/mr-/pl-/pr-/left-/right-`** — breaks RTL. Use logical properties (`ms-/me-/ps-/pe-/start-/end-`).
4. **Don't use `grid-cols-N` without a mobile fallback** — always start with `grid-cols-1` or `grid-cols-2` and add `sm:` / `md:` / `lg:` modifiers.
5. **Don't forget touch targets** — mobile buttons/inputs should be `py-3` (48px tall minimum); desktop can shrink to `py-2.5`.
6. **Don't put dropdowns at low z-index** — dropdowns like AirportSearch use `z-[60]` to clear the mobile bottom nav (`z-50`) and backdrop (`z-40`).
7. **Entity IDs ≠ IATA codes for Skyscanner** — if flight searches silently return empty, check that `entityId` is resolved (not just the 3-letter code).
8. **New user-visible strings → update `lib/i18n.jsx`** in both `en` and `ar` objects.

## Working Branch

All development happens on `claude/travel-intelligence-dashboard-W2m1f`. Commits go there; CI deploys to GitHub Pages from `main` after merge.

## Build / Verify

```bash
npm run build   # Verify static export succeeds (11 routes, should be ~152kB JS max)
npm run dev     # Local dev (basePath still applies — visit http://localhost:3000/Flight-finder-)
```

The build must succeed as `output: 'export'`; any "Route / used request.url" error means a server-only feature snuck in.
