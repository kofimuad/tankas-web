# Tankas UI Redesign — Screen Spec (backend-aligned)
Backend: FastAPI, Tankas API v0.3.0, ~60 endpoints, 17 tables.

## Design tokens (keep + elevate existing brand)
- Green #38e07b (primary), dark #0e1a13, bg #f6f8f7; Syne (display) + DM Sans (body); radius 0.75rem
- Badge tiers: bronze (0-100), silver (101-500), gold (501+)
- Issue points = difficulty(easy 10/med 20/hard 30) x priority(low 1.0/med 1.5/high 2.0)

## A. Public + Auth (5)
1. Landing        GET /stats, GET /events, GET /warriors
2. Sign up        POST /auth/signup
3. Log in         POST /auth/login
4. Verify email   POST /auth/otp/verify | /resend
5. Warriors       GET /warriors, GET /warriors/{id}

## B. Core (7)
6.  Dashboard      GET /users/me/dashboard -> stats{8}, recent_issues, recent_volunteering, badges
7.  Issues feed    GET /events (status filter, paging)
8.  Nearby map     GET /issues/nearby?latitude&longitude&radius_km
9.  Issue detail   GET /issues/{id} + /pledges + /comments + volunteers
10. Report issue   POST /issues (multipart, EXIF/GPS, AI labels + confidence)
11. Group          POST /volunteers, GET /volunteers/groups/{id}, transfer-leadership
12. Complete       POST /completion/confirm-participation | /complete | /verify-volunteers

## C. Collection flow (4) -- entirely missing from current frontend
13. Collections hub    GET /collections/stats (collector stats)
14. Destinations       GET destinations/nearby, POST destinations, assign-to-issue
15. Start -> Submit    POST start, POST submit (photo, quantity kg, GPS distance check)
16. Delivery verify    GET pending-verifications, POST verify-delivery

## D. Rewards + money (3)
17. Rewards catalog  GET /rewards (cost_in_points, is_available)
18. Redemptions      POST /rewards/{id}/redeem, GET /rewards/me/redemptions
19. Wallet           GET /payments/rates, POST /payments/withdraw-momo, GET /payments/history

## E. Social + profile (3)
20. Profile      GET/PATCH /users/me, PUT /users/me/avatar, badges grid, tier progress
21. Leaderboards GET /leaderboards/{type} x5 types, /context, /users/{id}/rank
22. My pledges   GET /users/me/pledges, POST fulfil, DELETE cancel

## F. Admin, desktop (3)
23. Overview     GET /admin/overview -> users/issues/volunteers/collections/points/payments
24. Users        GET /admin/users, ban/unban/make-admin
25. Moderation   GET /admin/issues/pending-review, POST classify, POST verify

## Gap vs current frontend
Existing pages (11): landing, login, signup, verify-email, dashboard, issues, issues/[id],
leaderboard, profile, redeem, report.
Missing (14): all of C, plus rewards catalog, redemptions, wallet/MoMo, comments,
group coordination, completion/verification, my-pledges, warriors, nearby map, all of F.

# ============================================================
# DESIGN SYSTEM — mobile-first, desktop-friendly, light + dark
# ============================================================

## Frames to lay out in Pencil
- Mobile  390 x 844   (primary; design every screen here first)
- Desktop 1440 x 1024 (adapt; sidebar 260px, content max-width 1200)
- Each screen gets a LIGHT and a DARK variant, side by side.

## Color tokens
LIGHT                          DARK
bg           #F7F9F8           #0B120E
surface      #FFFFFF           #101A14
surface-2    #EFF3F1           #16231B
border       #DDE5E1           #223029
text         #0E1A13           #E8F0EA
text-muted   #5B6B62           #8FA396
primary      #38E07B           #38E07B      (brand, unchanged)
on-primary   #06110A           #06110A      (dark text on green = AA pass)
primary-ink  #0F9D4F           #5BE894      (green for TEXT/links; brand green
                                             fails contrast on white)
NOTE: #38E07B is a fill colour, never a text colour on light bg.

## Semantic colours (shared, tuned per mode)
priority    low #64748B   medium #F59E0B   high #EF4444
difficulty  easy #22C55E  medium #F59E0B   hard #A855F7
status      open #38E07B  pending_review #F59E0B  resolved #3B82F6  rejected #EF4444
tier        bronze #CD7F32  silver #B8C0C4  gold #FFD43B

## Type — Syne (display) + DM Sans (body), already loaded in globals.css
                mobile / desktop
display         28 / 34   Syne 700
h1              24 / 32   Syne 700
h2              20 / 24   Syne 600
h3              17 / 20   Syne 600
body            15 / 16   DM Sans 400
body-strong     15 / 16   DM Sans 500
small           13 / 14   DM Sans 400
caption         11 / 12   DM Sans 500 (uppercase, 0.04em tracking)
numeric         Syne 700, tabular — for points/kg/rank

## Spacing, radius, elevation
4pt grid: 4 8 12 16 20 24 32 40 56
radius: sm 8 / md 12 / lg 16 / xl 20 / pill 999
gutters: mobile 16, desktop 32
elevation: LIGHT = soft shadow (0 1 2 rgba(14,26,19,.06), 0 8 24 rgba(14,26,19,.08))
           DARK  = border + faint inner glow, NOT shadow

## Navigation
MOBILE  bottom nav, 5 slots, centre is a raised FAB (Report). Height 64 + safe area.
        Home / Issues / [Report FAB] / Ranks / Profile
        Collections + Rewards live under Home as section entries.
DESKTOP left sidebar 260px, grouped: Discover (Feed, Map, Warriors),
        Act (Report, My Groups, Collections), Earn (Leaderboards, Rewards, Wallet),
        Account (Profile, Pledges). Admin section renders only when role=admin.

## Core components to draw once, then reuse
1.  stat-tile          label + big numeric + delta       (dashboard uses 8)
2.  issue-card         photo, title, priority pill, difficulty pill, points, distance
3.  tier-ring          circular progress, bronze/silver/gold, points-to-next
4.  pill               priority / difficulty / status variants
5.  leaderboard-row    rank, avatar+tier ring, name, metric  (+ "you" highlight)
6.  photo-dropzone     camera capture + GPS badge + EXIF note
7.  ai-label-chip      label + confidence %  (from YOLOv8 fields)
8.  map-pin            clustered, colour = status
9.  segmented-control  leaderboard type switch (5 options), status filters
10. empty-state        icon + line + action
11. sheet / modal      mobile = bottom sheet, desktop = centred dialog
12. kg-meter           collection quantity + GPS distance-check indicator

## Accessibility
- All text >= 4.5:1 in BOTH modes. Green on white is the trap — use primary-ink.
- Pills carry text, never colour alone.
- Tap targets >= 44x44.

# ============================================================
# BUILT IN ui.pen  (2026-08-25)
# ============================================================
Theme axis: `mode` = light | dark. Every screen exists as a light+dark pair;
dark is a theme swap on a copy, NOT a redraw. 32 design tokens drive both.

Components (top row of canvas, reusable):
  C/StatusBar  C/Pill  C/StatTile  C/IssueCard  C/TabBar

Screens (20 = 10 designs x light/dark):
  Dashboard / Mobile          Issues Feed / Mobile
  Issue Detail / Mobile       Report Issue / Mobile
  Collection Submit / Mobile  Leaderboard / Mobile
  Profile / Mobile            Rewards & Wallet / Mobile
  Sign In / Mobile            Dashboard / Desktop (1440x1024)

Verified: 0 layout problems across the document.

## Still to design (from the inventory above)
Nearby map, Warriors directory, Sign up, OTP verify, Group/volunteer
coordination, Complete issue + verify volunteers, Destinations, Delivery
verification queue, My pledges, Admin (overview / users / moderation).

# ============================================================
# IMPLEMENTED IN THE APP  (2026-08-25)
# ============================================================
Verified: `npx tsc --noEmit` clean, `npx eslint .` 0 problems, `next build` green
(14 routes), dev server smoke-tested (/, /login, /signup, /map all HTTP 200).

Foundation
  app/globals.css      tokens ported 1:1 from ui.pen, light + dark via `.dark`
                       (Tailwind v4 @theme inline + @custom-variant)
  app/layout.tsx       Syne + DM Sans via next/font (self-hosted, 0 requests to
                       fonts.googleapis.com), themeColor per scheme
  lib/design.ts        tier thresholds + points formula mirroring the backend
  next.config.ts       images.remotePatterns for res.cloudinary.com

Components
  ui/icon.tsx (hugeicons map)  ui/pill.tsx  ui/stat-tile.tsx  tier-hero.tsx
  issue-card.tsx  bottom-nav.tsx (capsule tab bar)  app-sidebar.tsx
  app-topbar.tsx  app-shell.tsx  theme-toggle.tsx (CSS-driven, no mount flag)
  auth-layout.tsx  issues-map.tsx (Leaflet, client-only)

Routes            /  /login  /signup  /verify-email  /dashboard  /issues
                  /issues/[id]  /map  /report  /collections  /leaderboard
                  /profile  /redeem

New API clients   publicApi (/stats)  commentsApi  rewardsApi  collectionsApi

## Deviations from the pen design (and why)
- Report screen: the design said a moderator sets priority. The API accepts
  `priority` from the reporter (difficulty is AI-derived), so the form keeps a
  priority selector and the notice was reworded.
- Icons are hugeicons, not lucide — components.json already sets
  `iconLibrary: hugeicons` and it was the installed set.
- /map was NOT in the pen design; built directly against /issues/nearby.

## Remaining
Destinations CRUD (create/delete depots) and the destination-staff delivery
verification queue are wired in lib/api.ts (getPendingVerifications,
verifyDelivery) but have no screen yet — they need a depot-operator role that
the app does not model.

# ============================================================
# SECOND PASS  (2026-08-25)
# ============================================================
Routes added: /warriors, /warriors/[id], /pledges, /groups/[id],
/collections/[issueId], /admin, /admin/users, /admin/issues
21 routes total. tsc clean, eslint 0 problems, build green, routes smoke-tested.

- /groups/[id]      members, confirm participation, leader upload-proof +
                    verify-volunteers checklist, transfer leadership
- /collections/[id] 3-step start -> collect -> deliver, kg stepper, depot
                    picker with a client-side GPS range check mirroring the
                    server's distance verification
- /admin/issues     classify difficulty + priority with a live points preview
                    computed from the same formula as PointsCalculator
- Admin sidebar group restored, gated on user.role === "admin"

# ============================================================
# DESIGN FILE COMPLETE  (2026-08-25)
# ============================================================
21 designs x light/dark = 42 screens. 5 reusable components.
Verified: 0 layout problems. (46 reported "clipped" nodes are all generated
map SVG paths intentionally clipped by the Map Canvas frame.)

Mobile (15)
  Dashboard          Issues Feed        Issue Detail
  Report Issue       Collection Submit  Leaderboard
  Profile            Rewards & Wallet   Sign In
  Sign Up            OTP Verify         Nearby Map
  Warriors           Group              My Pledges

Desktop 1440x1024 (6)
  Dashboard          Admin Overview     Admin Moderation
  Admin Users        Depots             Deliveries

Notes on the last pass
- Nearby Map uses a Generate("svg") street-map plate under real pin markers,
  so the map reads as a map without hand-drawn artwork.
- Group covers the whole completion flow: confirm participation, leader
  upload-proof, the verify-volunteers checklist, transfer leadership.
- Deliveries shows both GPS states — within range (green) and outside range
  (amber) — because that is the decision the depot operator actually makes.
- Depots + Deliveries are designed but NOT implemented: they need a
  depot-operator role the app does not model yet. Everything else on the
  canvas is built and live in the app.

Gotchas found while building (for future edits)
- Copy() ignores a `descendants` map keyed by name; set values with Update()
  on the copied ids instead.
- Copying a screen then deleting its children leaves nodes that do not lay
  out. Replace() the container, or build fresh.
- Text nodes reject `padding` — wrap them in a frame.
- A horizontal card with a fill_container-height child needs a fixed height
  on the card, or both collapse.
