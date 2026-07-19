# Original User Request

## 2026-07-18T09:57:41Z

Complete the `fade-finder` web application according to the specifications in `PLAN.md` and `TODO.md`, covering Consumer, Provider, and Admin routes, UI design modernization, tech debt refactoring, and comprehensive automated testing.

Working directory: /mnt/c/Users/jonat/~projects/fade-finder
Integrity mode: benchmark

## Requirements

### R1. Consumer (Client) App Experience
- Implement routes: `/login`, `/register`, `/` (landing/dashboard), `/search` (filters for service location, rating, distance, favorites; sorting; interactive map pins; center location setting; list/grid toggle), `/:barber-slug` (public profile with gallery, reviews, booking CTA, favorite CTA), `/profile`, `/booking/:barber-slug`, `/settings`, and `/billing`.

### R2. Provider (Barber) App Experience
- Implement routes: `/providers` (landing/dashboard with analytics overview and feed CTA), `/providers/login`, `/providers/register` (account creation submitting verification request to admin), `/providers/status` (registration status & tracker), `/providers/profile/private` (private profile management), `/providers/analytics`, `/providers/settings`, and `/providers/billing`.

### R3. Admin Experience
- Implement routes: `/admin` (dashboard for reviewing provider requests, site analytics, user moderation, DB recovery/MFA management), `/admin/settings`, `/admin/content`, `/admin/content/landing`, `/admin/content/providers-landing`. Move "Reset DB" from public nav to admin settings.

### R4. Design Modernization & Tech Debt Refactoring
- Replace inline styles with styled-components and build an atomic component library.
- Make hero section full width, remove "PWA" tag, create PWA splash screen & prominent logo display, and add an inline dismissable PWA install prompt.

### R5. Git Workflow & Testing Infrastructure
- Follow TODO.md instructions: for each task, create a feature branch off main, perform work, stage and commit logically, push and create PR, switch back to main and pull.
- Create unit tests for components, integration tests for routes, and Playwright E2E test suite supporting localhost/production testing of auth flows (client/provider/admin) and key user/provider workflows.

## Acceptance Criteria

### Verification & Quality Bar
- [ ] Next.js app builds cleanly without errors (`npm run build`).
- [ ] All unit, integration, and E2E tests pass (`npm test`, `npx playwright test`).
- [ ] Git repository contains clean commits and feature branch PRs as specified in `TODO.md`.
