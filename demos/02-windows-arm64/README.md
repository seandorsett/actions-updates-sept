# Demo 02 — Windows 11 arm64 with Visual Studio 2026 is GA

**Changelog date:** 20 August 2026
**Migration window:** 21 September 2026 → 30 September 2026
**Demo type:** Live demo

---

## What changed

Windows 11 arm64 hosted runners with **Visual Studio 2026** are now generally available under a new runner label:

```yaml
runs-on: windows-11-vs2026-arm
```

At the same time, the **existing `windows-11-arm` label will be migrated to Visual Studio 2026** between **21 September and 30 September 2026**. Nothing in your workflow files changes — the image behind the label changes underneath you.

The mitigation is to pin to an explicit label now, rather than relying on the floating one.

## Why DXC should care

This is a **breaking change that requires no action from an attacker and no change from a developer** to trigger. A build that is green on 20 September can be red on 1 October with an identical commit, an identical workflow file and an identical dependency set.

The blast radius is anything that depends on the VS2022 toolchain:

- **MSVC toolset version pinning** (`/vctoolsversion`, `msbuild` property overrides, `vcvarsall.bat` arguments referencing a `14.3x` toolset).
- **Windows SDK layout assumptions** — hard-coded paths under `C:\Program Files (x86)\Microsoft Visual Studio\2022\...` break immediately.
- **`vswhere` queries that assume a version range.**
- **C++/CLI, MFC, ATL and older platform toolsets** that may not be installed on the new image.
- **Any Dockerfile or setup script that greps for "2022".**

Because arm64 Windows builds are often a smaller, less-watched corner of a portfolio, the failure tends to surface late — often on a release branch. The audit is cheap and should happen before 21 September:

```
gh search code "windows-11-arm" --owner <your-org> --limit 100
```

Treat every hit as a change-management item with a hard deadline.

## Availability

| Where | Applies |
|---|---|
| github.com | **Yes** |
| GitHub Enterprise Cloud (GHEC) | **Yes** |
| GitHub Enterprise Server (GHES) | **No** — GHES does not offer GitHub-hosted runners; this is a hosted-runner image change |
| Team | Yes, where Windows arm64 hosted runners are available on the plan |
| Enterprise | Yes |

Windows arm64 hosted runners are **billable** and capacity-limited. This workflow is `workflow_dispatch`-only for that reason.

## Run the demo

1. Confirm you are pointed at the right repository:
   ```
   gh repo view seandorsett/actions-updates-sept
   ```

2. Dispatch the workflow:
   ```
   gh workflow run demo-02-windows-arm64.yml
   ```

   **Equivalent UI path:** `Actions` tab > **Demo 02 - Windows 11 arm64 + Visual Studio 2026** in the left sidebar > **Run workflow** > **Run workflow**.

3. Watch it. Windows arm64 runners can take a minute or two to be assigned:
   ```
   gh run watch
   ```

4. Open the completed run. You will see two jobs:
   - **Pinned label (windows-11-vs2026-arm)**
   - **Legacy label (windows-11-arm) - migrates Sept 21-30**

5. Open the **Pinned label** job and expand the step **Print installed Visual Studio version**. Read out the `catalog_productDisplayVersion` value.

6. Open the **Legacy label** job and expand the same step. Read out *its* `catalog_productDisplayVersion` value.

7. Put the two numbers side by side. **The difference between them is the demo.**

8. Show the mitigation in the file itself. Open `.github/workflows/demo-02-windows-arm64.yml` and scroll to the comment block at the top — the migration window and the pin-now guidance are stated there.

9. Close with the org-wide audit command:
   ```
   gh search code "windows-11-arm" --owner <your-org> --limit 100
   ```

## What to point out

- **The two version numbers.** Before 21 September, the legacy job reports a **Visual Studio 2022** version and the pinned job reports a **Visual Studio 2026** version. Point at both on screen simultaneously.
- **Nothing in the repository differs between the two jobs** except one string: the value of `runs-on`. Same steps, same probe, same commit.
- **After 30 September, the two numbers become identical.** Say this explicitly: "when I run this in October, these two will match, and no one will have changed a line of code. That is the breaking change."
- **`RUNNER_ARCH` / `PROCESSOR_ARCHITECTURE` both report ARM64** on both jobs — the architecture is not what is changing, the toolchain is. This pre-empts the "wait, is it not arm anymore?" question.
- **The `continue-on-error: true` on the legacy job** is deliberate demo hygiene, not a recommendation for production.

## Expected result

**If you present before 21 September 2026** (the expected case for a Sept 8 session):

- `pinned-vs2026` succeeds and prints a **Visual Studio 2026** `catalog_productDisplayVersion`.
- `legacy-label` succeeds and prints a **Visual Studio 2022** `catalog_productDisplayVersion`.
- The two values visibly differ. That is success.

**If you present after 30 September 2026:**

- Both jobs print a Visual Studio 2026 version. The migration has completed. The demo becomes a retrospective — "here is what changed, and here is why pinning mattered."

**During the window (21–30 September):** the legacy label may report either version depending on when your job is scheduled. Call that out as the practical hazard of a floating label.

## Caveats / if it fails

- **These runners cost money and are capacity-limited.** Budget for a couple of runs, not a dozen. Do not put this workflow on a `push` trigger.
- **Runner availability is the most likely failure.** If `windows-11-vs2026-arm` is not available on your plan or in your org's allowed runner set, the job will sit queued indefinitely. **Check this the day before the session by dispatching the workflow once.**
- **`vswhere.exe` not found** causes the step to exit 1 with a clear message including the path it looked at. If that happens on the pinned image, the image layout has changed — fall back to reading the version from the run's "Runner Image" annotation in the job log header, which lists the image name and version.
- **Org runner policy** may block Windows arm64 entirely. Check `Organization settings` > `Actions` > `Runners` before presenting.
- **Fallback if the live run fails:** dispatch this workflow the day before and keep the successful run open in a second browser tab. The two version numbers are the entire payload — a screenshot of them is a perfectly good substitute, and you should have one regardless.
- **If only the legacy job fails,** that is still a usable demo: it means the migration is in flight. Narrate it as such rather than treating it as a broken demo.
