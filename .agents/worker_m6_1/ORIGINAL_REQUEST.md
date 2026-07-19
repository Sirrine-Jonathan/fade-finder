## 2026-07-18T18:17:23Z
You are Worker 6 for Milestone 6 (M6_ADMIN) of the fade-finder project.
Your working directory is: /mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m6_1

Please create your working directory metadata files (BRIEFING.md, progress.md) in /mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m6_1/.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope and Objective:
Read master project scope at /mnt/c/Users/jonat/~projects/fade-finder/.agents/orchestrator/PROJECT.md, plan at /mnt/c/Users/jonat/~projects/fade-finder/.agents/orchestrator/plan.md, and PLAN.md.

Execute Milestone 6 (Admin App Experience & CMS):
1. Adhere strictly to TODO.md git workflow:
   - Make sure you start on `main` (pull/merge main).
   - Create and checkout a new branch `feature/admin-routes` off `main`.
2. Implement Admin Routes & Pages:
   - `/admin`:
     - Unauthenticated: Single email/password login form with MFA / recovery key input (`admin@fadefinder.com`).
     - Authenticated Admin: Dashboard for reviewing provider verification requests (Approve/Reject CTAs), site analytics overview, user moderation list, DB recovery & MFA management links.
   - `/admin/settings`: Site configuration management and relocated "Reset DB" action (`POST /api/admin/reset-db` executing `npm run db:reset`).
   - `/admin/content`: CMS dashboard.
   - `/admin/content/landing`: Content management page for consumer landing page (`/`). Edit hero heading, subheading, features, announcement.
   - `/admin/content/providers-landing`: Content management page for provider landing page (`/providers`). Edit hero heading, subheading, pitch points.
3. Integrate styled-components atomic UI components from M3.
4. Verify clean build (`npm run build`).
5. Stage changes, perform logical commits on `feature/admin-routes`, push branch, and merge into `main`.
6. Write handoff report to `/mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m6_1/handoff.md` and message the orchestrator.
