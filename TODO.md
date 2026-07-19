# TODO

## Instructions

For each of these todo items:

- create a new branch off main
- perform the work
- check that tests pass and that the build is successful
- stage changes and create logically grouped commits
- push the branch to origin
- open a pull request on origin
- leave the pull request unmerged so it can be reviewed
- switch back to main
- pull from origin/main

## Items

- [x] execute PLAN.md
- [x] search UI should be behind basic user auth
- [x] top nav is a bit crampt on mobile, need to fix that.
- [x] unseed database and write natural lifecycle e2e test suite with cleanup
- [ ] execute PLAN_V2.md
- [ ] build AuthProvider context and global session management (/api/auth/me)
- [ ] implement mobile-first, role-aware dynamic Navbar with mobile drawer and bottom navigation bar
- [ ] create consumer appointment history route (/history) with status filtering and action CTAs
- [ ] implement password recovery flow (/api/auth/forgot-password, reset modals on login pages)
- [ ] enhance provider status tracker (/providers/status) with application lifecycle step visualizer
- [ ] set up Vitest and React Testing Library for component & auth helper unit testing
- [ ] expand Playwright E2E test suite for mobile drawer, bottom nav, role-based header, and history route
