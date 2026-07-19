# Project Architecture & Scope: Fade Finder

## Architecture Overview
- **Framework**: Next.js 16 (App Router) with React 19 & TypeScript.
- **Database & ORM**: Prisma ORM with SQLite (development/testing) & Postgres schema compatibility.
- **Styling**: `styled-components` with Next.js App Router Registry, global theme, and atomic component architecture.
- **PWA Capabilities**: Service worker, PWA manifest, splash screen, and inline dismissable install prompt.
- **Testing**: Vitest/Jest for unit & integration testing; Playwright for E2E testing across Client, Provider, and Admin roles.

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1_DB_AUTH | DB Schema expansion (barber slug, verification, content, MFA key), seed script enhancement (`npm run db:reset`), Auth API routes (`/api/auth/*`, `/api/barbers/*`, `/api/appointments/*`, `/api/admin/*`) | None | DONE |
| 2 | M2_TEST_TRACK | Parallel E2E Testing Track: setup Playwright test runner, create Tiers 1-4 test cases covering all consumer/provider/admin flows, publish `TEST_READY.md` | None | DONE |
| 3 | M3_UI_PWA | Styled-components registry setup, atomic component library (`src/components/ui/*`), full-width hero, logo display, PWA splash screen & inline install prompt, move reset DB to admin | M1 | IN_PROGRESS |
| 4 | M4_CONSUMER | Consumer (Client) App Routes (`/login`, `/register`, `/`, `/search`, `/:barber-slug`, `/profile`, `/booking/:barber-slug`, `/settings`, `/billing`) | M1, M3 | IN_PROGRESS |
| 5 | M5_PROVIDER | Provider (Barber) App Routes (`/providers`, `/providers/login`, `/providers/register`, `/providers/status`, `/providers/profile/private`, `/providers/analytics`, `/providers/settings`, `/providers/billing`) | M1, M3 | IN_PROGRESS |
| 6 | M6_ADMIN | Admin App Routes (`/admin`, `/admin/settings`, `/admin/content`, `/admin/content/landing`, `/admin/content/providers-landing`) | M1, M3 | IN_PROGRESS |
| 7 | M7_E2E_VERIFY | Final verification & coverage hardening: pass 100% E2E tests (Tiers 1-4), Tier 5 adversarial testing, clean build (`npm run build`), clean audit | M2, M4, M5, M6 | PLANNED |

## Interface Contracts & API Definitions

### Auth & Session APIs
- `POST /api/auth/login` - Authenticates user (CLIENT, BARBER, ADMIN) and sets session cookie.
- `POST /api/auth/register` - Registers CLIENT or BARBER account (creates verification request if BARBER).
- `POST /api/auth/logout` - Clears session cookie.
- `GET /api/auth/me` - Returns current authenticated user and role.

### Barber APIs
- `GET /api/barbers` - Search barbers with location, radius, ratings, service type (STUDIO / HOUSE_CALL), favorites, sorting (price, rating, distance).
- `GET /api/barbers/[slug]` - Public barber profile data, reviews, gallery, services.
- `PUT /api/barbers/private` - Barber private profile management (bio, radius, auto-confirm, working hours, services, gallery).
- `GET /api/barbers/analytics` - Barber analytics (profile views, search appearances, favorite count).

### Appointment APIs
- `POST /api/appointments` - Create appointment request (location type, client address/coords, service, time).
- `GET /api/appointments` - List appointments for client or barber.
- `PATCH /api/appointments/[id]` - Update appointment status (confirm, cancel, complete).

### Admin APIs
- `GET /api/admin/verifications` - Pending barber verification requests.
- `POST /api/admin/verifications/[id]/approve` - Approve barber registration.
- `POST /api/admin/verifications/[id]/reject` - Reject barber registration.
- `GET /api/admin/analytics` - Site-wide usage and reliability metrics.
- `POST /api/admin/reset-db` - Execute database reset and seed (relocated from public route).
- `GET/PUT /api/admin/content/[page]` - Manage CMS landing/provider landing page content.

## Code Layout

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (consumer)/
│   │   ├── page.tsx (dashboard / landing)
│   │   ├── search/page.tsx
│   │   ├── [barber-slug]/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── booking/[barber-slug]/page.tsx
│   │   ├── settings/page.tsx
│   │   └── billing/page.tsx
│   ├── providers/
│   │   ├── page.tsx (dashboard / landing)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── status/page.tsx
│   │   ├── profile/private/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   └── billing/page.tsx
│   ├── admin/
│   │   ├── page.tsx (dashboard)
│   │   ├── settings/page.tsx
│   │   └── content/
│   │       ├── page.tsx
│   │       ├── landing/page.tsx
│   │       └── providers-landing/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── barbers/
│   │   ├── appointments/
│   │   ├── admin/
│   │   └── reset-db/
│   ├── layout.tsx
│   └── registry.tsx (styled-components Next.js registry)
├── components/
│   ├── ui/ (atomic styled components: Button, Card, Input, Modal, Navbar, Footer, Badge, MapPin, RatingStars, InstallPrompt, Hero)
│   └── features/ (domain components: SearchFilters, BarberCard, BookingForm, AnalyticsChart, VerificationTracker)
├── lib/
│   ├── prisma.ts
│   ├── geo.ts
│   └── auth.ts
prisma/
├── schema.prisma
└── seed.ts
e2e/
├── auth.spec.ts
├── consumer.spec.ts
├── provider.spec.ts
├── admin.spec.ts
└── pwa.spec.ts
```
