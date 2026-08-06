# GymCrush — Website

Marketing & legal site for **GymCrush**, the gamified fitness app for couples.

Static site — plain HTML, no build step, no dependencies. Deployed to Cloudflare
Pages at **https://gymcrush.pages.dev**.

> The canonical host is `gymcrush.pages.dev`. **`gymcrush.app` belongs to a third
> party** — never point invite links, legal URLs or the AASA file at it.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page — hero, screenshot carousel, how-it-works, features, data stance |
| `privacy.html` | Privacy policy — **linked from inside the app**, must never 404 |
| `terms.html` | Terms of Use / EULA — **linked from inside the app**, must never 404 |
| `support.html` | FAQ, troubleshooting, contact — used as the App Store support URL |
| `invite-landing.html` | Fallback page for `/invite/<token>` when the app isn't installed |

`styles.css` holds everything shared; each page adds only its own layout on top.
`carousel.js` is external rather than inline so the CSP can forbid inline scripts.

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

- `icon.png` — the real app icon, 512px, copied from
  `SoftQuestArcade/Assets.xcassets/AppIcon.appiconset/`. **Re-copy it whenever
  the app icon changes**, or the site and the App Store listing disagree.
- `assets/` — favicons, apple-touch-icon, and `og-image.png` (the 1200×630 card
  used by iMessage, TikTok, X and friends)
- `fonts/` — Rubik, subset to latin and self-hosted as woff2

### Fonts are self-hosted on purpose

Loading Rubik from the Google Fonts CDN sends every visitor's IP address to
Google. That needs a legal basis under GDPR and would contradict the "no
third-party tracking" claim in the privacy policy. Self-hosting removes the
third-party request entirely, which is also why this site sets **no cookies**
and needs **no consent banner**.

If you ever change weights, regenerate with `pyftsubset` (fonttools + brotli)
from the TTFs in the app repo at `SoftQuestArcade/Resources/Fonts/`.

### Screenshots

`screenshots/01.png … 05.png` are **placeholders**. Drop in real captures at
App Store 6.7" size (1290×2796, portrait) using the same filenames, and update
the `alt` text in `index.html` to describe what each one actually shows. Or
regenerate branded placeholders with `python3 make_placeholder_screens.py`.

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
