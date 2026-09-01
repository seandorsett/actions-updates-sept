# Demo 05 — More control over hosted runners

**Changelog date:** 25 June 2026
**Demo type:** Live demo (the control is UI; the effect on a workflow is very demoable)

---

## What changed

Four related improvements to GitHub-hosted runner management:

1. **macOS runners can now be placed in runner groups.** Previously macOS was the gap in runner-group coverage.
2. **Runners can be scoped by organisation, repository *or workflow*.** Workflow-level scoping is the new granularity — you can say "only this specific workflow may use these runners".
3. **Concurrency limits can be set per runner group.** A cap on how many jobs a group will run at once.
4. **Default labels such as `ubuntu-latest` can be disabled**, so teams are forced onto your managed labels instead of the standard hosted ones.

Item 4 is the one that changes behaviour visibly, and it is what this demo exercises.

## Why DXC should care

**Disabling default labels is a governance primitive that did not exist before.** Until now, "please use our managed runners" was a policy statement enforced by code review and hope. Any developer could type `runs-on: ubuntu-latest` and get a standard hosted runner regardless of what the platform team wanted. Now that label can simply stop resolving, and the job fails to find a runner. Policy becomes mechanism.

That matters in three concrete situations DXC will recognise:

- **Cost control.** Steering all jobs onto groups with concurrency limits gives a hard ceiling on parallel spend rather than an after-the-fact bill.
- **Network egress and data residency.** If the managed runners are the ones inside the correct network boundary, allowing `ubuntu-latest` is a hole in that boundary. Disabling it closes the hole.
- **Compliance evidence.** "Builds can only run on approved infrastructure" is materially easier to evidence when the unapproved option does not resolve.

**The migration risk is the flip side and must be planned.** The moment `ubuntu-latest` is disabled, *every* workflow in scope that uses it breaks — including third-party actions' reusable workflows and anything vendored from a template. This is a change that wants an inventory first:

```
gh search code "runs-on: ubuntu-latest" --owner <your-org> --limit 100
```

**Also note:** workflow-level scoping is a useful middle ground for the transition — you can permit specific workflows onto the managed group before you turn off the default label globally.

**Constraint to flag:** **network configurations are not supported for macOS runners.** macOS can now live in a group, but it cannot take a network configuration. If the network boundary is the reason for the group, macOS is not covered by it.

## Availability

| Where | Applies |
|---|---|
| github.com | Via Team / Enterprise plans only |
| GitHub Enterprise Cloud (GHEC) | **Yes** |
| GitHub Enterprise Server (GHES) | **No** — GHES does not provide GitHub-hosted runners or hosted runner groups |
| Team | **Yes** |
| Enterprise | **Yes** |
| Free / Pro | **No** |

**This is Team and Enterprise only.** Be explicit — a Free or Pro organisation cannot follow along, and there is no hosted-runner-group equivalent on GHES.

**Additional constraint:** network configurations are **not supported for macOS runners**, even though macOS runners can now be placed in groups.

## Run the demo

This demo has **two runs**. The contrast between them is the whole point, so do not skip the first one.

### Run 1 — baseline

1. Dispatch the workflow:
   ```
   gh workflow run demo-05-runner-labels.yml
   ```

   **Equivalent UI path:** `Actions` tab > **Demo 05 - Runner labels and groups** in the left sidebar > **Run workflow** > **Run workflow**.

2. Watch it:
   ```
   gh run watch
   ```

3. Open the completed run. You will see two jobs:
   - **Default label (ubuntu-latest)** — succeeds, prints `runner.name`, `runner.os`, `runner.arch`.
   - **Managed label (group-scoped)** — targets `[self-hosted, linux, dxc-managed]`. If you do not have a runner with those labels it will not find one; it carries `continue-on-error: true` so it does not fail the run.

4. Expand the **Default label** job and read out the `runner.name`. Point out it is a standard GitHub-hosted runner.

### Change the setting

5. Go to the organisation runner group settings:
   `Organization settings` > `Actions` > **Runner groups** > select the group.

   *(For an enterprise-level group: `Enterprise settings` > `Policies` > `Actions` > **Runner groups**.)*

6. Find the option controlling **default labels** and **disable `ubuntu-latest`**.

7. While you are on this screen, point at the other three capabilities from the changelog, because they live here too:
   - **macOS runners** can now be added to this group.
   - **Scoping** — organisation / selected repositories / **selected workflows**. Open the workflow-scoping option so the audience sees the new granularity.
   - **Concurrency limit** for the group.

### Run 2 — the effect

8. Dispatch the same workflow again, unchanged:
   ```
   gh workflow run demo-05-runner-labels.yml
   ```

9. Watch the **Default label (ubuntu-latest)** job. It now **cannot find a runner** — it sits queued and then fails to start.

10. Say the important sentence: **"I did not change one character of the workflow file. The same file, the same commit, and now it cannot run."**

11. **Re-enable `ubuntu-latest` afterwards** unless you intend to leave the org in that state. Do not leave a demo setting applied to a shared organisation.

## What to point out

- **The identical workflow file across both runs.** Show the file, or the commit SHA on both runs — they are the same. Only org configuration changed.
- **The failure mode is "cannot find a runner", not "permission denied".** The job does not error with an access message; the label simply does not resolve. This is worth calling out because it is what a developer will actually see, and it is not obvious from the error what happened.
- **`runner.name` in run 1** — a standard hosted runner name, versus the managed group's runners.
- **The workflow-scoping dropdown.** "Selected workflows" is genuinely new granularity and is the thing most people in the room will not know exists. Open it.
- **The concurrency limit field.** Frame it as a spend ceiling, not just a throughput setting.
- **macOS in a group — with the caveat.** Mention in the same breath that network configurations are not supported for macOS runners, so the group boundary does not extend to network policy for those runners.
- **The migration hazard.** Before anyone disables `ubuntu-latest` in anger, they need the inventory. Show the `gh search code` command.

## Expected result

**Run 1 (baseline):**
- `default-label` job → **succeeds**, prints a GitHub-hosted `runner.name`, `runner.os: Linux`, `runner.arch: X64`.
- `managed-label` job → succeeds if you have matching self-hosted runners; otherwise it does not find a runner and is neutralised by `continue-on-error: true`.

**Run 2 (after disabling `ubuntu-latest`):**
- `default-label` job → **does not start**. Queued, then fails to acquire a runner. **This failure is success for the demo.**
- `managed-label` job → unchanged from run 1.

If you have real `dxc-managed` runners online, the ideal version of this demo is: run 1 both green, run 2 with the default job dead and the managed job still green — which is exactly the state a governed estate wants to be in.

## Caveats / if it fails

- **You need organisation (or enterprise) admin rights** to see and change runner group settings. A repository admin cannot do this. **Confirm your access before the session.**
- **Team or Enterprise plan required.** On Free or Pro the runner group settings page does not exist.
- **You are changing a shared organisation setting live.** If this org is used by anyone else, disabling `ubuntu-latest` will break *their* builds too, not just your demo. Strongly prefer a dedicated demo organisation. If you must use a shared one, do it out of hours and re-enable immediately.
- **Re-enable the label afterwards.** Put it on your post-session checklist. This is the single most likely way to cause real damage with these demos.
- **The `managed-label` job will not find a runner** unless you have registered self-hosted runners with the labels `self-hosted`, `linux` and `dxc-managed`. That is expected and handled by `continue-on-error: true` — but say so, or the audience will read it as a broken demo.
- **Setting propagation is not always instantaneous.** Give it a moment between step 6 and step 8. If run 2 still succeeds, wait and re-dispatch once before concluding anything.
- **The exact UI wording and placement of the default-label control varies** as the feature evolves. **Navigate to it yourself the day before** and note the precise path.
- **Fallback if you cannot change org settings live:** take screenshots of the runner group settings page (with the default-label control, workflow scoping and concurrency limit visible) and of a queued-then-failed `ubuntu-latest` job, and narrate from those. Alternatively, present the two runs from a prepared org where you made the change in advance.
- **Do not demo this on the customer's production organisation.** Use your own.
