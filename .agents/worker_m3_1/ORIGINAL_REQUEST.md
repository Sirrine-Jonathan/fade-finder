## 2026-07-18T11:11:28-06:00
You are Worker 3 for Milestone 3 (M3_UI_PWA) of the fade-finder project.
Your working directory is: /mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m3_1

Please create your working directory metadata files (BRIEFING.md, progress.md) in /mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m3_1/.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope and Objective:
Read master project scope at /mnt/c/Users/jonat/~projects/fade-finder/.agents/orchestrator/PROJECT.md, plan at /mnt/c/Users/jonat/~projects/fade-finder/.agents/orchestrator/plan.md, and PLAN.md.

Execute Milestone 3 (Styled UI System, Atomic Components & PWA Modernization):
1. Adhere strictly to TODO.md git workflow:
   - Make sure you start on `main` (or pull/merge main).
   - Create and checkout a new branch `feature/ui-pwa-system` off `main`.
2. Styled-Components Registry Setup:
   - Install `styled-components` if needed (`npm install styled-components` and `@types/styled-components`).
   - Setup styled-components registry for Next.js 16 App Router in `src/app/registry.tsx` (or `StyledComponentsRegistry`) and integrate into `src/app/layout.tsx`.
   - Define theme configuration (`src/styles/theme.ts`) and global styles (`src/styles/GlobalStyles.ts`).
3. Atomic Reusable Component Library (`src/components/ui/`):
   - Build styled components: `Button`, `Card`, `Input`, `Select`, `Badge`, `Modal`, `Navbar`, `Footer`, `MapPin`, `RatingStars`, `Toast`, `Hero`, `InstallPrompt`.
   - Ensure clean props, responsive layout, dark/light theme support.
4. Design Modernization:
   - Create Modern Hero Section component (full width, high visual impact, removing card wrapper around hero text).
   - Display Logo prominently in Header and Landing Hero.
   - Remove "PWA" tag from header title.
   - Remove "Reset DB" from public Navbar (relocate to Admin Settings).
5. PWA Modernization:
   - Create PWA manifest (`public/manifest.json`).
   - Create PWA splash screen component and logo display.
   - Create inline dismissable PWA Install Prompt component (`src/components/ui/InstallPrompt.tsx`) with localStorage dismissal persistence.
6. Verify build (`npm run build`).
7. Perform logical commits on `feature/ui-pwa-system`, push branch, and merge into `main` (or document PR/merge).
8. Write handoff report to `/mnt/c/Users/jonat/~projects/fade-finder/.agents/worker_m3_1/handoff.md` and message the orchestrator.
