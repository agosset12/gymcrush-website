# GymCrush — Website

Marketing & legal site for **GymCrush**, the gamified fitness app for couples.

Static site — plain HTML, no build step, no dependencies. Deployed to Cloudflare
Pages at **https://gymcrush.pages.dev**.

> The canonical host is `gymcrush.pages.dev`. **`gymcrush.app` belongs to a third
> party** — never point invite links, legal URLs or the AASA file at it.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page — hero with the App Preview, screenshot strip, how-it-works, privacy stance |
| `privacy.html` | Privacy policy — **linked from inside the app**, must never 404 |
| `terms.html` | Terms of Use / EULA — **linked from inside the app**, must never 404 |
| `support.html` | FAQ, troubleshooting, contact — used as the App Store support URL |
| `invite-landing.html` | Fallback page for `/invite/<token>` when the app isn't installed |

`styles.css` holds everything shared; each page adds only its own layout on top.
`carousel.js` (screenshot-strip arrows + video pause button) is external rather than inline so the CSP can forbid inline scripts.

## Why the app depends on this site

Two things break if this site does:

1. **`GymCrushLegalLinks`** in the iOS app opens `/privacy.html` and `/terms.html`.
   Apple rejects builds with Sign in with Apple + auto-renewing subscriptions
   whose legal links 404.
2. **Universal links.** `/.well-known/apple-app-site-association` is what lets
   `https://gymcrush.pages.dev/invite/<token>` open the app.

## Cloudflare Pages configuration

- **Build command:** _(none)_
- **Build output directory:** `/` (repo root)

Three config files do real work, and two of them fail *silently* when wrong:

- **`_headers`** — sets the site-wide security headers, and forces
  `Content-Type: application/json` on the association file. Without that header
  Cloudflare guesses `text/plain`, Apple refuses the file, and universal links
  never activate with no error anywhere.
- **`_redirects`** — rewrites `/invite/*` to `/invite-landing.html` with status
  `200`. The destination must live **outside** `/invite/`, or Cloudflare treats
  the rule as a rewrite loop and drops it silently.
- **`.well-known/apple-app-site-association`** — must match the app's Team ID
  and bundle ID, and must be served with no redirects and no auth.

## Assets

- `icon.png` — the real app icon, 512px, from
  `ios/GymCrush/Assets.xcassets/AppIcon.appiconset/gymcrush-app-icon.png` in the app
  repo. **Regenerate every icon below whenever the app icon changes**, or the site
  and the App Store listing disagree: `assets/icon.webp` (256px, what the pages
  show), `favicon.ico` (16/32/48), `assets/favicon-16/32.png` (corners rounded,
  transparent), `assets/apple-touch-icon.png`
  (180px, square — iOS rounds it).
- `assets/og-image.png` — the 1200×630 share card used by iMessage, TikTok, X and
  friends, built in the App Store set's style (Nunito Black, coral pill, two frames).
- `fonts/` — Rubik (body) and Nunito 800/900 (display, stands in for SF Pro
  Rounded off Apple devices), subset to latin and self-hosted as woff2

### Design system

The site copies the App Store screenshot set (`appstore/` in the app repo): cream
`#FFF8EF` ground, navy `#102354` ink, a single coral `#F66F7D` `.pill` on the words
that matter, rounded display type, soft navy-tinted shadows. No emoji, no gradients,
no feature-card grids — the screenshots carry the product.

### Fonts are self-hosted on purpose

Loading Rubik from the Google Fonts CDN sends every visitor's IP address to
Google. That needs a legal basis under GDPR and would contradict the "no
third-party tracking" claim in the privacy policy. Self-hosting removes the
third-party request entirely, which is also why this site sets **no cookies**
and needs **no consent banner**.

If you ever change weights, regenerate with `pyftsubset` (fonttools + brotli)
from the TTFs in the app repo at `SoftQuestArcade/Resources/Fonts/`.

### Screenshots

`screenshots/01.webp … 08.webp` are the final App Store set (`~/Desktop/GC_screenshots`),
resized to 660px wide (`cwebp -q 84 -resize 660 0`). `media/preview.mp4` is the App
Preview re-encoded silent at 600px wide (H.264, CRF 25, faststart, ~3 MB);
`media/preview-poster.webp` is its 1-second frame. Keep new media lossy and small.

## Going live

The App Store ID is **6766544775**. When the listing goes public, in `index.html`:

1. Uncomment the `apple-itunes-app` smart-banner meta tag in `<head>`.
2. Swap the inert `.store-badge` `<div>` for the `<a>` kept in the comment beside it.

Both are marked with a `LAUNCH DAY` comment block. Nothing else needs to change —
`invite-landing.html` already links to the real listing.

## Keeping the legal pages honest

The privacy policy describes the app's **actual** data flows: photos uploaded to
the `couple_moments` bucket, PostHog events linked to the account identifier (not
anonymous), push tokens, the onboarding quiz, and the fact that the app never
touches HealthKit. If any of that changes in the app, update `privacy.html` and
the "Last updated" date in the same pull request — a policy that disagrees with
the App Store privacy labels is a rejection, and a policy that disagrees with
reality is a bigger problem than that.
