# Demo 04 — Code coverage automatic enablement

**Changelog date:** 4 August 2026
**Status:** Public preview
**Demo type:** Live demo — *no workflow file in this repo, and that is the point*

---

## What changed

GitHub can now **generate a code coverage workflow for you using AI** and open it as a **pull request**, rather than making you write it. It inspects the repository, works out the language, test runner and coverage tooling, and produces a workflow with **least-privilege permissions** already set.

You review it as a normal PR, edit it if you want, and merge it. Nothing is pushed to your default branch without review.

This repository deliberately contains **a working test suite and no coverage workflow** so the feature has something real to act on.

## Why DXC should care

**The cost is in the long tail, not the flagship repos.** A platform team can hand-write a coverage workflow for the ten repositories that matter. The problem is repository 200 through 900 — the ones with tests but no coverage reporting, because nobody had a spare afternoon. This closes that gap at effectively zero marginal cost per repo.

**The PR-based delivery is the important design decision.** It is not a silent commit, not a settings toggle that changes behaviour invisibly, and not a bot with write access to `main`. It is a reviewable diff. That maps cleanly onto existing change control: the same reviewers, the same branch protection, the same audit trail. For a regulated or heavily-governed estate, "it opens a PR" is the sentence that makes this adoptable.

**Least-privilege permissions are generated, not assumed.** Hand-written workflows very often inherit broad default `GITHUB_TOKEN` permissions because writing an explicit `permissions:` block is extra effort. Generated ones ship with the narrow block already in place. Across hundreds of repos that is a meaningful reduction in token blast radius.

**Caveat for planning:** this is **public preview** and **not available on GHES**. Do not build a rollout plan that assumes parity across a mixed estate.

## Availability

| Where | Applies |
|---|---|
| github.com | **Yes** — public preview |
| GitHub Enterprise Cloud (GHEC) | **Yes** — public preview |
| GitHub Enterprise Server (GHES) | **No** — not available on GHES |
| Team | **Yes** |
| Enterprise | Yes (via GHEC) |

**State the GHES gap plainly.** Of the six topics in this session, this is one of two that a GHES-based DXC estate cannot use at all (the other is topic 6, Code Quality billing path). If any part of the estate is GHES, this is cloud-only tooling.

## Run the demo

1. **Prerequisite — install dependencies so the tests are demonstrably real:**
   ```
   npm install
   ```
   This installs jest (~268 packages, under a minute). **Do this before the session** — you do not want to watch npm resolve a dependency tree in front of an audience.

2. **Prove the tests actually pass:**
   ```
   npm test
   ```
   Expected: **2 test suites, 11 tests, all passing.**

3. **Show the coverage number that GitHub is about to start reporting for you.** This is a local preview only — it is *not* the feature, it is context:
   ```
   npx jest --coverage
   ```
   Expected: roughly **79% statements, 75% branches**. `src/calculator.js` sits around 69% and `src/stringUtils.js` around 91%.

4. **Prove there is no coverage workflow.** Show the audience the workflow directory:
   ```
   gh workflow list
   ```
   or in the UI: `Actions` tab > the left sidebar workflow list. There is no coverage workflow. There is also no `codecov.yml`, no `collectCoverage` in `package.json`, and no coverage config anywhere.

5. **Trigger automatic enablement.** In the browser:
   `Settings` > `Code security` > find **Code coverage** > **Enable**.

   *(Public-preview features move in the UI. If it is not under `Code security`, check the repository `Settings` landing page and the `Actions` settings page. Confirm the exact location the day before.)*

6. **Wait for GitHub to open the pull request.** This is not instantaneous — allow a few minutes. Watch for it with:
   ```
   gh pr list
   ```
   or in the UI: the `Pull requests` tab.

7. **Open the generated PR and read the workflow file in the diff.**

8. **Point at the `permissions:` block** in the generated workflow. Read it out loud.

9. **Point out that it correctly identified jest** — it read `package.json`, saw `"test": "jest"`, and generated a jest coverage workflow rather than a generic one.

10. **Do not merge it live** unless you have time to let the resulting workflow run. If you do merge, the coverage report appears on subsequent pull requests.

## What to point out

- **The absence first, the presence second.** Show the empty workflow list *before* enabling. The audience needs to see that there was nothing there, or the PR is unimpressive.
- **It is a pull request, not a commit.** Say this explicitly. "This did not touch my default branch. It opened a diff and asked."
- **The `permissions:` block.** This is the detail that security-minded people in the room will care about most, and it is easy to scroll past. Stop on it.
- **It picked the right test runner.** It read the repo. Contrast with a template-based approach that would have given you a generic workflow to fill in.
- **The coverage number is not 100%.** `src/calculator.js` has an untested `percentage()` function and an untested negative-exponent branch in `power()`; `src/stringUtils.js` has an untested custom-separator path in `slugify()`. A realistic partial number is far more useful in a demo than a green 100% — it shows the tool reporting something you would actually act on.
- **Public preview.** Set expectations honestly: UI placement and behaviour may change.

## Expected result

- `npm test` → **11 passed, 2 suites**.
- `npx jest --coverage` → around **79% statements / 75% branches**, with visible uncovered lines in both source files.
- After enabling, GitHub opens a **pull request** titled along the lines of "Add code coverage workflow", containing a new workflow file under `.github/workflows/`.
- The generated workflow contains an explicit, narrow `permissions:` block.
- Your default branch is **unchanged** until you merge.

## Caveats / if it fails

- **Node must be installed** on the presenting machine. Verify with `node --version` and `npm --version`. Any Node 18+ is fine; this was authored against Node 22.
- **`npm install` must have been run before the session.** If you skip it, `npm test` fails with "jest: not found" and the demo dies at step 2.
- **This is public preview.** The UI location in step 5 is the most likely thing to have moved. **Click through the full path yourself the day before and note where it actually is.**
- **PR generation is not instant.** It can take several minutes. Dispatch it early — ideally enable it at the start of the topic and come back to it, rather than staring at an empty `Pull requests` tab.
- **Not available on GHES.** If the customer is demoing on their own GHES instance, this cannot be reproduced there at all.
- **Repository must have detectable tests.** That is why this repo has a real jest suite. On a repo with no tests, there is nothing for the feature to generate against.
- **Actions must be enabled** on the repository (`Settings` > `Actions` > `General` > Allow all actions, or an allowlist that permits the generated workflow's actions).
- **Fallback if the PR does not appear live:** enable the feature the day before on a scratch repository with the same structure, and keep the resulting PR open in a second tab. The generated diff — particularly the `permissions:` block — is the entire payload. A pre-generated PR demonstrates it just as well.
- **If you merge during the session,** be aware the coverage report itself only surfaces on *subsequent* pull requests, so you will need a throwaway PR to show it. Usually not worth the time in a one-hour session.
