# GitHub Project Task Runner — Agent Prompt

You are tasked with picking up and executing work items from the GitHub Project board for this repository (`Sirrine-Jonathan/fade-finder`).

## Instructions & Workflow

1. **Query the Board**:
   Run the following CLI command to fetch all items on GitHub Project #10:
   ```bash
   gh project item-list 10 --owner Sirrine-Jonathan --format json
   ```

2. **Select Next Task**:
   Find the highest priority task currently in the `Todo` column. If no specific task was requested by the user, select the top `Todo` item.

3. **Create Feature Branch**:
   Check out `main`, pull the latest code, and branch off:
   ```bash
   git checkout main && git pull origin main
   git checkout -b feature/<descriptive-task-name>
   ```

4. **Perform Implementation & Verification**:
   - Implement the requested feature or fix cleanly.
   - Run unit tests, E2E tests, and production build verification:
     ```bash
     npm test && npm run test:e2e && npm run build
     ```

5. **Commit & Open Pull Request**:
   - Stage changes and make logically grouped commits.
   - Push the branch to `origin`:
     ```bash
     git push -u origin feature/<descriptive-task-name>
     ```
   - Open an unmerged Pull Request:
     ```bash
     gh pr create --title "<type>(<scope>): <summary>" --body "<Detailed description of changes>"
     ```

6. **Update Project Board Status**:
   - Move the completed task item status on the board as appropriate.

7. **Clean Up Workspace**:
   Return to `main` and ensure your working directory is clean:
   ```bash
   git checkout main && git pull origin main
   ```
