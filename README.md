# GymCrush — Website

Marketing & legal site for **GymCrush**, the cute, gamified fitness app for couples.

Static site — plain HTML with inline CSS, no build step. Structure mirrors the Noir site.

## Pages
- `index.html` — landing page (wordmark, tagline, screenshot carousel, "coming soon" App Store badge)
- `privacy.html` — privacy policy (account/couple data, Supabase + PostHog + RevenueCat + Apple)
- `terms.html` — terms of use
- `support.html` — FAQ, troubleshooting, contact

## Assets
- `icon.png` — app icon (placeholder; swap for the final icon when ready)
- `screenshots/01.png … 05.png` — **placeholder** App Store screenshots

### Replacing the placeholder screenshots
Drop real captures into `screenshots/` named `01.png … 05.png` (App Store 6.7" size,
1290×2796, portrait). Or re-generate branded placeholders:

```sh
python3 make_placeholder_screens.py
```

## Going live
When the app is published, swap the "Coming soon" badge in `index.html` for a real
App Store link (`https://apps.apple.com/...id<APP_ID>`).

## Deploy (Cloudflare Pages)
- Connect this repo to Cloudflare Pages.
- **Build command:** _(none)_
- **Build output directory:** `/` (repo root)

It's pure static files, so it also works on any static host or by opening `index.html` locally.
