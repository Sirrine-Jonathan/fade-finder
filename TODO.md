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

- [x] logged out home page is displaying more like the search page rather than a logged out landing page.
- [x] update prisma according to the build output:
      ┌─────────────────────────────────────────────────────────┐
      │ Update available 6.19.3 -> 7.8.0 │
      │ │
      │ This is a major update - please follow the guide at │
      │ https://pris.ly/d/major-version-upgrade │
      │ │
      │ Run the following to update │
      │ npm i --save-dev prisma@latest │
      │ npm i @prisma/client@latest │
      └─────────────────────────────────────────────────────────┘
- [x] specify node and npm according to the build output:
      engines.node (package.json): unspecified
      engines.npm (package.json): unspecified (use default)
- [x] add morgan or some server side logging for better telemetry
- [x] remove emojis. They are unprofessional.
- [x] remove admin links from footer as admin will know to use '/admin' to get to the admin portion of the site which will be protected with admin authentication.
- [ ] double check client auth. prove it is working with e2e tests.
