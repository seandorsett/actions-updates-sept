# Demo 01 — Actions retention now covers checks, workflow runs and statuses

**Changelog date:** 27 August 2026
**Effective date:** 1 October 2026
**Demo type:** Live demo (partial — the workflow generates the data, the setting is shown in the UI)

---

## What changed

Check runs, workflow runs and commit statuses used to be retained for 400+ days, completely independently of your Actions retention setting. From 1 October 2026 they follow the **same** Actions retention setting that already governs artifacts and logs, which defaults to **90 days**.

To reflect the wider scope, the repository and organization setting has been renamed from "Artifact and log retention" to **"Check, workflow run, status, artifact and log retention"**.

The change is **not retroactive** — it only applies to data created after 1 October 2026. Existing retention caps still apply, and public repositories remain capped at a maximum of 90 days. This metadata is **not billed**.

## Why DXC should care

Anything that reads historical check, run or status data more than 90 days after the fact will silently start coming back empty. The most common places this bites:

- **Compliance and audit evidence.** If an auditor asks "show me the passing check on this release commit from 8 months ago", that status may no longer exist. Evidence that used to be retrievable on demand now needs to be exported and stored deliberately.
- **DORA / DevEx metrics pipelines** that query the Checks or Statuses APIs over long windows will see their history truncate at the retention boundary.
- **Release provenance tooling** keyed on commit statuses.
- **Branch protection archaeology** — investigating "was this merge actually green?" for an old commit.

The correct response is not to crank retention to the maximum. It is to decide, before 1 October, which of this data is genuinely evidence and to export that to durable storage. Because the change is not retroactive, there is a window where old data survives and new data does not — expect confusing "it worked for the old commit but not the new one" reports.

## Availability

| Where | Applies |
|---|---|
| github.com | **Yes** |
| GitHub Enterprise Cloud (GHEC) | **Yes** |
| GitHub Enterprise Server (GHES) | Follows in a later GHES release — check your version's release notes |
| Team | **Yes** |
| Enterprise | **Yes** |

Public repositories are capped at 90 days and cannot be raised above it.

## Run the demo

1. Make sure you are authenticated and pointed at this repository:
   ```
   gh auth status
   gh repo view seandorsett/actions-updates-sept
   ```

2. Dispatch the workflow with the default 7-day retention:
   ```
   gh workflow run demo-01-retention.yml -f retention_days=7
   ```

   **Equivalent UI path:** `Actions` tab > select **Demo 01 - Retention (checks / workflow runs / statuses)** in the left sidebar > **Run workflow** button on the right > leave `retention_days` at `7` > **Run workflow**.

3. Watch the run and open it when it completes:
   ```
   gh run watch
   ```
   Or in the UI: `Actions` > click the run at the top of the list.

4. On the run summary page, scroll to the bottom and point at the **Artifacts** section. You will see `demo-01-build-output` with its expiry.

5. Open the job log and expand the step **Emit log output to point at**. This is the *log* half of the setting.

6. Now show the commit status the run created. In the UI, go to the `Code` tab and look for the green check next to the latest commit, then click it and find `demo-01/retention-scope` in the list.

   Or via CLI:
   ```
   gh api repos/seandorsett/actions-updates-sept/commits/main/statuses --jq '.[] | {context, state, created_at}'
   ```

7. **Now switch to the setting.** Navigate to `Settings` > `Actions` > `General` and scroll to the **Artifact and log retention** area.

8. Read the setting's new name aloud: **"Check, workflow run, status, artifact and log retention"**. Point out that the word "check", "workflow run" and "status" are new in that title.

9. For the org-level view: `Organization settings` > `Actions` > `General` > same section. Point out that the org value sets the ceiling for repositories beneath it.

## What to point out

- **The renamed setting is the whole story.** Put the run page and the settings page side by side. Say: "everything I just showed you — the artifact, the log, the status, and the run record itself — now expires on one dial, and that dial defaults to 90 days."
- **The commit status specifically.** That is the item whose lifetime is genuinely changing from 400+ days down to the retention value. Artifacts and logs were already governed.
- **The "not retroactive" line.** Anything created before 1 October keeps its old lifetime. This is why the failure mode is confusing rather than obvious.
- **The 90-day public repository cap.** If someone asks "can't we just set it to 400?", the answer is no for public repos.
- **It is not billed.** Pre-empt the "so this will cost us more" question — this metadata carries no storage charge.

## Expected result

- The workflow run completes green.
- An artifact named `demo-01-build-output` is attached to the run with a visible expiry date roughly 7 days out.
- A commit status with context `demo-01/retention-scope` and state `success` exists on the commit.
- The job log contains the banner block listing all five governed data types.
- `Settings` > `Actions` > `General` shows the setting labelled **"Check, workflow run, status, artifact and log retention"**.

If the setting still reads only "Artifact and log retention", your instance has not received the rename yet — say so plainly and use the changelog entry as the reference instead.

## Caveats / if it fails

- **Permissions.** The workflow needs `statuses: write`, which is declared in the file. If the commit status step fails with a 403, check `Settings` > `Actions` > `General` > **Workflow permissions** and confirm it is not set to read-only. If it is, either switch it to read and write, or accept the failure and point at the artifact and log instead.
- **You need admin on the repo (and the org, for the org-level view)** to open the retention settings pages. Confirm this before you present — this is the single most likely thing to derail the demo.
- **`retention_days` is capped.** If you pass a value above the repository or organization maximum, the upload silently clamps to the cap. That is worth demonstrating deliberately: re-run with `-f retention_days=400` on a public repo and show it landing at 90.
- **The rename may not be visible yet** depending on rollout to your instance. The workflow output still works; only step 8 depends on the UI.
- **Fallback if the live run fails:** the run does not actually need to be fresh. Open any previous successful run of this workflow and point at its artifact, log and status. Have one pre-run before the session as insurance.
- **Do not expect to see the change in effect.** This demo shows the *scope* of the setting, not expiry itself — you cannot watch something expire in a 45-minute session. Be explicit about that so nobody waits for a deletion that will not happen.
