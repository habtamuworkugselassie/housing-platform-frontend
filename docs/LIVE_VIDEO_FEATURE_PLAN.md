# Live Video Broadcast & Visitor Feedback — Feature Plan

Status: **In progress** — Phase 1 (admin config + external‑embed broadcast + social links) under implementation.

## Goal

While the exhibition is running, show a **"Live now"** zone on the exhibition landing page:

1. **Broadcast player** — plays either an external embed (YouTube / Facebook Live) **or** a self‑hosted HLS stream, selectable per event by an admin.
2. **Watch‑on links** — YouTube / TikTok / Facebook buttons (reusing the icon set the footer already ships).
3. **Visitor video feedback** — visitors submit a short clip; approved clips appear in a feed beneath the player.

Everything is gated and configured from **Admin → Display Settings**, mirroring how `exhibitionSponsorshipPackagesVisible` already works today.

## Scope decisions (confirmed with the product owner)

- Intent: **both** a live broadcast **and** a visitor video‑feedback feed.
- Video source: support **both** external embeds and self‑hosted HLS.
- Control: **admin‑controlled** via Display Settings (a "Live now" toggle + config), so the zone auto‑appears only while enabled and nothing needs a redeploy to go live.

## How it maps onto the current code

Display settings already flow end‑to‑end and are the right vehicle:

- Public read: `GET /public/display-settings` → `src/shared/composables/useDisplaySettings.ts` (`DisplaySettings` interface, `defaults`, `mergeDisplaySettings`, `coerceDisplayBool`).
- Admin read/write: `GET|PUT /admin/display-settings` → `src/features/admin/api/admin.api.ts` (`getDisplaySettings` / `updateDisplaySettings`), typed in `src/features/admin/api/admin.types.ts`, edited in `src/features/admin/views/AdminDisplaySettingsView.vue`.
- Landing gate pattern to copy: `ExhibitionLandingView.vue` `showExhibitionSponsorshipPackages` computed (`settings.exhibitionSponsorshipPackagesVisible !== false`).

Other relevant facts:

- No `<iframe>`/embed pattern exists yet — the live embed is a **new** component. The only existing video playback is native `<video>` for sponsor clips in `SponsorCarouselSection.vue`.
- Social icon paths: YouTube lives in `OrganizationSocialLinks.vue`; TikTok lives (hardcoded) in `Footer.vue`'s `socialLinks`. There is no shared icon module, so Phase 1 promotes the YouTube/TikTok/Facebook SVG paths into one small shared module.
- URL helper `normalizeExternalUrl` only ensures an `https://` prefix; converting a YouTube/Facebook watch URL into an embeddable URL is a new helper.
- i18n strings live in `src/i18n/locales/en.json` and `am.json` under `exhibition.*` and `admin.displaySettings.*` — every new string is added to **both** locales.

---

## Phase 1 — Admin config + live broadcast (external embed) · shippable first

New display‑settings fields (backend + frontend types):

| field | type | meaning |
| --- | --- | --- |
| `exhibitionLiveVisible` | bool | master on/off for the Live zone |
| `liveSourceType` | `EXTERNAL_EMBED` \| `HLS` | which player to render |
| `liveEmbedUrl` | string | YouTube/Facebook Live watch or embed URL |
| `liveHlsUrl` | string | self‑hosted `.m3u8` URL (Phase 3) |
| `liveTitle` | string | heading shown above the player |
| `liveYoutubeUrl` / `liveTiktokUrl` / `liveFacebookUrl` | string | "watch on" social links |

Frontend work:

- `useDisplaySettings.ts` + `admin.types.ts`: add the fields, defaults, and boolean coercion.
- `AdminDisplaySettingsView.vue`: a "Live stream" card — toggle + source dropdown + URL fields + social URLs, wired into `form` and `save()`.
- `src/shared/components/socialIcons.ts` (new): shared YouTube / TikTok / Facebook SVG paths.
- `src/shared/utils/urls.ts`: add `toEmbedUrl(url)` — YouTube/Facebook watch → embed.
- `src/features/exhibition/components/LiveStreamSection.vue` (new): responsive 16:9 player (external `<iframe>` branch now; HLS branch stubbed for Phase 3), a "LIVE" badge, title, and the social "watch on" buttons.
- Insert it as the first `<section>` of `ExhibitionLandingView.vue`, gated by a `showExhibitionLive` computed.
- i18n: `exhibition.liveStream.*` and `admin.displaySettings.exhibitionLive*` in both locales.

## Phase 2 — Visitor video feedback feed

Decisions (confirmed):

- **Submitters: anonymous.** Any visitor submits with name + email + a short video. Needs guardrails: size/duration caps, `video/*` content‑type allowlist, and a per‑IP rate limit (implemented without Redis).
- **Moderation: flag‑driven.** A display‑setting `exhibitionFeedbackAutoPublish` decides the flow:
  - flag **on** → new submissions are published immediately (`APPROVED`);
  - flag **off** → new submissions are held (`PENDING`) until an admin approves them.
  Admins can always reject/delete regardless. A second flag `exhibitionFeedbackVisible` shows/hides the whole feedback section.

Work:

- Backend: `ExhibitionVideoFeedback` entity (UUID id, submitter name/email, video URL, optional caption, `status` PENDING/APPROVED/REJECTED, timestamps, submitter IP) + Flyway migration + repository. Public `POST` (multipart upload, reusing existing media‑upload infra; status set from the auto‑publish flag) and public `GET` (approved only). Admin list/approve/reject/delete. The two flags are added to display‑settings (same mechanism as the live fields).
- Frontend: a feedback section beneath the live zone — a submit widget (file upload first; in‑browser `MediaRecorder` a later enhancement) + a responsive grid of approved clips using the native `<video>` pattern from `SponsorCarouselSection.vue`. An admin moderation view following existing admin list/card patterns. Admin toggles for the two flags in Display Settings.

## Phase 3 — Self‑hosted streaming (its own project)

- Infrastructure (not app code): a media server (MediaMTX / nginx‑rtmp / managed service) ingesting RTMP from the venue and publishing HLS; TLS, storage, bandwidth/cost planning, and a fallback when the stream drops.
- App side is small: an `hls.js`‑backed `<video>` branch in `LiveStreamSection` for `liveSourceType === 'HLS'` (native HLS already plays in Safari; `hls.js` covers Chrome/Firefox).

## Phase 4 — Mobile (`housing_platform_mobile`, Flutter)

- Mirror the read‑only surfaces: a live section (webview embed or `video_player`+HLS) and the approved‑feedback feed, driven by the same public display‑settings + feedback endpoints. Recording/upload is a later mobile follow‑up.

## Recommended sequencing

Ship **Phase 1 + 2** first (external embed + feedback upload + admin control + social links) — fully functional with **no new infrastructure**; going live is just pasting a YouTube/Facebook Live URL. Add **Phase 3** self‑hosting once the streaming/bandwidth budget is known, and **Phase 4** mobile after the web version proves out.
