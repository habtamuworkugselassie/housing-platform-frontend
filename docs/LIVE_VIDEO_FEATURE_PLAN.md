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

## Phase 3 — Self‑hosted HLS playback for the single organizer embed

- Small: an `hls.js`‑backed `<video>` branch in `LiveStreamSection` for `liveSourceType === 'HLS'` (native HLS already plays in Safari; `hls.js` covers Chrome/Firefox), pointing at a `liveHlsUrl`. This covers the simplest case — one organizer stream published as HLS — and is superseded for multi‑broadcaster live by Phase 5.

## Phase 5 — Live broadcasting from device cameras (self‑hosted, gated)

Confirmed decisions: **self‑hosted** backbone; **gated go‑live** — broadcasters request to go live (or must be a signed‑in exhibitor/organizer), an organizer approves, and any stream can be cut instantly (kill‑switch).

Three broadcaster types, one system:
1. **Visitors / exhibitors** — phone (Flutter) or browser camera over **WebRTC**.
2. **Organizers with a professional camera** — camera → laptop/OBS → **RTMP or WHIP ingest**.
3. **Viewers** — watch at scale over **HLS** (10–30 s latency, cheap to fan out); optional low‑latency WebRTC for featured streams.

### Core: self‑hosted LiveKit

LiveKit (open source) is the SFU. Its **access‑token grants are the gating mechanism**, so no separate permission layer is needed:
- **LiveKit server** — WebRTC SFU + built‑in TURN. Single node to start (Redis only needed for multi‑node clustering).
- **LiveKit Ingress** — accepts RTMP/WHIP so an organizer's OBS/hardware encoder (pro camera) publishes into a room.
- **LiveKit Egress** — transcodes a room to **HLS** for scalable viewing and records to disk/object storage.
- **TURN** — LiveKit embeds TURN; needs a public UDP/TCP port + TLS for restrictive networks (venue Wi‑Fi, mobile).

Deploy via `docker-compose.livekit.yml` (server + ingress + egress) with a `livekit.yaml`; keys/secret via env. TLS on a `live.` subdomain.

### App control plane (our backend — the gate)

We never expose LiveKit keys to clients. The backend owns rooms, approvals and **token minting** (a LiveKit token is a plain JWT signed HS256 with the LiveKit API secret + a `video` grant claim — minted with the existing JJWT dependency, no new library):

- Entity `LiveBroadcast` (room, title, broadcaster identity/name/role visitor|exhibitor|organizer, optional company, status `REQUESTED`→`APPROVED`/`REJECTED`→`LIVE`→`ENDED`, hlsUrl, timestamps) + migration + repository.
- Public: `POST /exhibition/live/request` (visitor/exhibitor/organizer requests to go live) → creates a `REQUESTED` row; `GET /exhibition/live` (approved/live streams for the public wall); `GET /exhibition/live/{id}/viewer-token` (a subscribe‑only LiveKit token, or the HLS URL) once live.
- Broadcaster: `GET /exhibition/live/{id}/publish-token` — returns a **publish** LiveKit token **only if** the request is `APPROVED` (gate). Enforced server‑side by the grant.
- Admin (`ADMIN_SECURED`): list requests, `approve` / `reject`, and **`end` (kill‑switch)** — calls the LiveKit server API to remove the participant/room and marks `ENDED`.
- Config: `livekit.url`, `livekit.api-key`, `livekit.api-secret` (env). Reuse the display‑settings `exhibitionLiveVisible` flag to surface the live wall.

### Clients

- **Web** — `livekit-client` SDK: a broadcaster view (request → once approved, `getUserMedia` + publish) and a viewer (HLS `<video>`/`hls.js`, or subscribe for low latency). Organizer "go live" screen. Admin moderation gets live‑now list + Cut button.
- **Mobile (Flutter)** — `livekit_client` + `flutter_webrtc`: request‑to‑go‑live, publish camera, and watch. (Phase 4 mobile work.)

### Guardrails

Gated approval + kill‑switch; signed‑in identity for exhibitor/organizer; recording retained for audit; per‑account concurrent‑stream limits; bandwidth/egress cost watched via HLS fan‑out rather than per‑viewer WebRTC. TURN/TLS required for venue and mobile networks.

### Sequencing within Phase 5

1. Infra compose (LiveKit server + ingress + egress + config) — deployable.
2. Backend control plane (entity + token minting + request/approve/reject/end) — the gate.
3. Web broadcaster + viewer + admin Cut UI.
4. Flutter broadcaster + viewer.
5. Organizer pro‑camera path (OBS → Ingress) documented + tested.

## Phase 4 — Mobile (`housing_platform_mobile`, Flutter)

- Mirror the read‑only surfaces: a live section (webview embed or `video_player`+HLS) and the approved‑feedback feed, driven by the same public display‑settings + feedback endpoints. Recording/upload is a later mobile follow‑up.

## Recommended sequencing

Ship **Phase 1 + 2** first (external embed + feedback upload + admin control + social links) — fully functional with **no new infrastructure**; going live is just pasting a YouTube/Facebook Live URL. Add **Phase 3** self‑hosting once the streaming/bandwidth budget is known, and **Phase 4** mobile after the web version proves out.
