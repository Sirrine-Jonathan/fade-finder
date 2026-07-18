# Fade Finder — E2E Testing Infrastructure & Philosophy (`TEST_INFRA.md`)

## 1. Testing Philosophy
Fade Finder uses Playwright for End-to-End (E2E) automated integration and behavioral testing. The core testing philosophy rests on four pillars:
1. **User-Centric Behavioral Automation**: Tests interact with the application strictly as real human users (Clients, Barbers/Providers, and System Administrators) using accessible locators (`getByRole`, `getByPlaceholder`, `getByText`, page URLs, and semantic IDs/selectors).
2. **Deterministic & Self-Contained Test State**: Tests manage their own setup/teardown, utilizing database resets (`/api/admin/reset-db` / `npm run db:reset`) and predictable mock datasets to eliminate flaky dependencies.
3. **Multi-Role Coverage Matrix**: Full test isolation and coverage across Client/Consumer journeys, Provider management workflows, and Administrator control panels.
4. **Resilient & Flexible Selector Strategy**: Tests leverage resilient locators that validate both existing live endpoints and upcoming App Router pages, with fallback handling for ongoing milestone rollouts.

---

## 2. Playwright Configuration Strategy
- **Configuration File**: `playwright.config.ts`
- **Base URL Support**: Configured to dynamically target `process.env.TEST_TARGET_URL` or local dev instance (`http://localhost:3000`), defaulting to production/staging endpoint (`https://fade-finder-app-53fb0754df0f.herokuapp.com`).
- **Viewport**: 1280 x 800 (Desktop Chrome baseline) with mobile viewport testing capability (375 x 667).
- **Timeouts**: 30,000ms per test execution timeout; 10,000ms assertion timeout.
- **Artifacts**: Screenshots on failure (`only-on-failure`), trace recording on retry, video retention on failure.

---

## 3. Tiered Coverage Goals (Tiers 1 – 4)

### **Tier 1: Core Feature & Route Navigation Coverage**
Validates that all critical user, provider, and admin routes are reachable, authenticated protection works, and essential UI components (Hero, Navbar, Search Filters, Forms, Cards, Dashboards) render without client-side exceptions or unhandled errors.

### **Tier 2: Boundary Conditions & Corner Cases**
Tests extreme inputs and boundary conditions:
- Empty search results (unmatched queries or restrictive radius/rating filters).
- Invalid credential submissions (wrong password, missing required registration fields).
- Boundary rating values (0 to 5 stars) and distance bounds (0 miles to maximum service radius).
- Unauthenticated access attempts to protected client, provider, and admin routes.

### **Tier 3: Cross-Feature & Multi-Role Interactions**
Tests complex multi-step workflows bridging multiple domain boundaries:
- Client books appointment -> Barber sees request in Provider Dashboard -> Barber confirms request -> Status reflects on Client view.
- Provider registers -> Account flagged as `PENDING` -> Admin views verification request in Admin Dashboard -> Admin approves request -> Barber profile becomes `APPROVED` and searchable.

### **Tier 4: End-to-End User Scenarios & Real-World Journeys**
Simulates complete real-world user lifecycles:
- **Client Full Journey**: Registration -> Login -> Search with location/filters -> Slug profile inspection -> Booking request -> Settings management -> Account deletion / Logout.
- **Provider Full Journey**: Provider landing pitch -> Registration -> Status tracking -> Private profile customization (services, rates, auto-confirm) -> Analytics check -> Logout.
- **Admin Full Journey**: Admin login -> Verification review -> CMS page content management -> Site analytics audit -> Database reset execution.

---

## 4. Requirement & Feature Mapping

| Spec File | Feature / Route Scope | Covered Test Cases |
|-----------|------------------------|--------------------|
| `e2e/auth.spec.ts` | `/login`, `/register`, `/providers/login`, `/providers/register`, `/admin`, logout, forgot password, account deletion, route protection | - Client registration & login<br>- Barber registration & login<br>- Admin login & recovery<br>- Protected route redirects for unauthenticated users<br>- Forgot password modal/link workflows<br>- Account cleanup & deletion |
| `e2e/consumer.spec.ts` | `/`, `/search`, `/:barber-slug`, `/profile`, `/booking/:barber-slug`, `/settings`, `/billing` | - Landing page hero & pitches<br>- Search filters (In-Studio vs House-Call, min rating, max distance, favorites)<br>- Sorting controls (Price, Rating, Distance)<br>- Interactive Map Pins & Center Location setting<br>- List / Grid view toggle<br>- Barber card CTAs & Slug profile deep-dive<br>- Appointment booking form & submission<br>- Client settings & billing placeholders |
| `e2e/provider.spec.ts` | `/providers`, `/providers/status`, `/providers/profile/private`, `/providers/analytics`, `/providers/settings`, `/providers/billing` | - Provider landing page pitch & onboarding<br>- Verification status tracker (`PENDING` -> `APPROVED`)<br>- Private profile manager (bio, working hours, pricing tiers, auto-confirm toggle)<br>- Provider analytics dashboard (views, search appearances, favorites count)<br>- Provider settings & billing setup |
| `e2e/admin.spec.ts` | `/admin`, `/admin/settings`, `/admin/content`, `/admin/content/landing`, `/admin/content/providers-landing` | - Admin dashboard & metrics overview<br>- Provider verification request review (Approve / Reject)<br>- Site-wide analytics & reliability reports<br>- CMS content management for landing & provider landing pages<br>- Relocated Database Reset (`npm run db:reset`) execution |
