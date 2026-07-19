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

- [ ] update prisma according to the build output:
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
- [ ] specify node and npm according to the build output:
      engines.node (package.json): unspecified
      engines.npm (package.json): unspecified (use default)
- [ ] add morgan or some server side logging for better telemetry
