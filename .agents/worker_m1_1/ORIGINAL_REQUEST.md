## 2026-07-18T17:36:15Z
You are Worker 2 for Milestone 1 (M1_DB_AUTH) of the fade-finder project.
Your working directory is: /mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m1_1

Please create your working directory metadata files (BRIEFING.md, progress.md) in /mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m1_1/.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope and Objective:
Read the master implementation blueprint from Explorer 1 at /mnt/c/Users/jonat/~projects/fade-finder/.agents/explorer_m1_1/handoff.md as well as /mnt/c/Users/jonat/~projects/fade-finder/.agents/orchestrator/PROJECT.md.

Execute Milestone 1 (DB Schema, Seed Script & Auth API Foundation):
1. Adhere strictly to TODO.md git workflow:
   - Make sure you start on `main` (or pull/merge main).
   - Create and checkout a new branch `feature/db-auth-foundation` off `main`.
2. Update `prisma/schema.prisma`:
   - Add `slug` (unique string) and `verificationStatus` enum (PENDING, APPROVED, REJECTED) to `BarberProfile`.
   - Add `mfaRecoveryKey` (optional string) to `User`.
   - Add `CmsContent` model (`id`, `page` unique, `title`, `heroHeading`, `heroSubheading`, `featuresJson`, `announcement`, `updatedAt`).
3. Apply schema changes:
   - Run `npx prisma db push` and `npx prisma generate`.
4. Update `prisma/seed.ts`:
   - Seed 6 barbers (5 APPROVED with unique slugs `marcus-vance`, `derek-miller`, `elena-rostova`, `jamal-blendz`, `carlos-gomez`; 1 PENDING `jake-fresh`).
   - Seed 10 clients with past/upcoming appointments and bi-directional reviews.
   - Seed 1 admin user (`admin@fadefinder.com` with hashed password and `mfaRecoveryKey: ADMIN-RECOVERY-KEY-2026-X89K`).
   - Seed default `CmsContent` for `landing` and `providers-landing`.
5. Run `npm run db:reset` to verify database scrub and seed execution.
6. Create `src/lib/auth.ts`:
   - Implement password hashing/verification using Node's `crypto` module (`scrypt` or `pbkdf2`).
   - Implement token creation & verification (`fadefinder_session` cookie).
   - Implement `getSessionUser(request)` and `setSessionCookie(response, token)` / `clearSessionCookie(response)`.
7. Implement API Routes:
   - `src/app/api/auth/login/route.ts`
   - `src/app/api/auth/register/route.ts`
   - `src/app/api/auth/logout/route.ts`
   - `src/app/api/auth/me/route.ts`
   - `src/app/api/barbers/route.ts` (filter by `verificationStatus = APPROVED`, search/location/favorites support).
   - `src/app/api/barbers/[slug]/route.ts` (fetch public barber profile by slug or ID).
   - `src/app/api/barbers/private/route.ts` (barber private profile settings GET/PUT).
   - `src/app/api/appointments/route.ts` (GET/POST/PATCH appointments).
   - `src/app/api/admin/verifications/route.ts` (GET pending verifications, POST approve/reject).
   - `src/app/api/admin/reset-db/route.ts` (Admin protected DB reset).
8. Run `npm run build` and `npm run db:reset` to verify clean build and reset.
9. Perform logical commits on `feature/db-auth-foundation`, push branch, and merge into `main` (or document PR/merge).
10. Write handoff report with exact build and DB reset results to `/mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m1_1/handoff.md` and message the orchestrator.
