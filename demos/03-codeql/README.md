# Demo 03 — CodeQL 2.26.3

**Changelog date:** 19 August 2026
**Demo type:** Live demo — *this is the strongest demo in the set*

---

## What changed

CodeQL 2.26.3 shipped six changes that affect GitHub Actions workflow analysis. Two of them make CodeQL **see more**, three make it **complain less**, and one is **breaking**:

1. **Untrusted data in `merge_group` triggers is now analysed.** Merge queue workflows were previously a blind spot.
2. **BREAKING — the query `codeql.actions.security.SelfHostedQuery` was removed.** Any suppression, filter, dashboard or policy that references that query ID is now pointing at nothing.
3. **Fewer false positives from `output-clobbering/high`** on simple `jq` path filters whose values stay JSON-encoded.
4. **Cache-poisoning and untrusted-checkout alert paths now start at the controlling expression** rather than deeper in the data flow. Same alert, dramatically shorter and more readable path.
5. **`envvar-injection/critical` now requires both an untrusted source *and* a privileged context from the same trigger.** Previously either half could produce a critical on its own.
6. **Three cache-poisoning queries now account for the read-only cache change** that shipped in June 2026.

This is auto-deployed to github.com. GHES picks it up in a later release.

## Why DXC should care

Three distinct operational impacts, in order of urgency:

**1. The removed query is a hard break.** If any team has `codeql.actions.security.SelfHostedQuery` in a `.github/codeql/codeql-config.yml` `query-filters` block, in a custom query suite, in a dismissal automation, or in a security dashboard, that reference is now dead. Depending on where it lives it either silently does nothing or errors the analysis. Grep for it across the org:

```
gh search code "SelfHostedQuery" --owner <your-org> --limit 100
```

**2. Alert volume will move — in both directions.** Merge-queue coverage adds findings. The two false-positive reductions remove findings. If a team tracks "open code scanning alerts" as a KPI or has a gate that fails on alert-count delta, that number will jump around for reasons unrelated to code quality. Warn them before they open a ticket about it.

**3. Triage gets materially faster.** The alert-path change (item 4) is the one engineers will actually feel day to day. Previously a cache-poisoning path started somewhere in the middle of a data flow and you had to reason backwards to find the expression that actually controlled it. Now the path opens on the controlling expression. This is a genuine reduction in time-to-understand per alert, and it's the thing to show on screen.

## Availability

| Where | Applies |
|---|---|
| github.com | **Yes** — auto-deployed, already live |
| GitHub Enterprise Cloud (GHEC) | **Yes** — auto-deployed |
| GitHub Enterprise Server (GHES) | **Not yet** — ships in a later GHES release. GHES customers are still on an older CodeQL and will not see these behaviour changes |
| Team | Yes (code scanning availability per plan) |
| Enterprise | Yes |

**Be explicit with the audience about GHES.** If any DXC estate is on GHES, none of this is live for them yet, and the removed-query break arrives with their next upgrade — which makes it a *planned* break they can prepare for rather than one that already happened.

## Run the demo

1. **Prerequisite check — code scanning must be enabled on the repo.** In the browser:
   `Settings` > `Code security` > **Code scanning** > ensure it is set up.
   If it is not, the analyze step fails with a 403 when it tries to upload results. **Do this before the session, not during it.**

2. Dispatch the CodeQL workflow:
   ```
   gh workflow run demo-03-codeql.yml
   ```

   **Equivalent UI path:** `Actions` tab > **Demo 03 - CodeQL (Actions analysis)** in the left sidebar > **Run workflow** > **Run workflow**.

3. Watch it complete (expect 1–3 minutes):
   ```
   gh run watch
   ```

4. While it runs, open `.github/workflows/demo-03-codeql.yml` and point out the line that makes this demo different from every other CodeQL demo:
   ```yaml
   languages: actions
   ```
   CodeQL is analysing **the workflow files themselves**, not application source.

5. Open the four specimens in a second tab so the audience can see what is being analysed:
   - `.github/workflows/vuln-01-untrusted-checkout.yml`
   - `.github/workflows/vuln-02-envvar-injection.yml`
   - `.github/workflows/vuln-03-jq-output-clean.yml`
   - `.github/workflows/vuln-04-self-hosted.yml`

   **Say out loud that every job in all four files carries `if: ${{ false }}` and can never execute.** They exist only so CodeQL has something to read.

6. When the run finishes, go to `Security` tab > **Code scanning**.

7. Filter to `Tool: CodeQL`.

8. Walk the alert list against the expected matrix (below).

9. **Open the alert raised from `vuln-01-untrusted-checkout.yml` and click "Show paths".** This is the money shot for change #4 — read out the first node of the path and point out that it is the controlling expression, not a midpoint in the flow.

10. Close by scrolling to the bottom of the run log, step **Where to look next**, which prints the expected-alert matrix directly in the run output.

## What to point out

- **`languages: actions`** — CodeQL analysing YAML, not code. Many people in the room will not know this exists.
- **The alert path on vuln-01.** Open it, expand it, and say: "this path used to start further down. Starting at the controlling expression is the difference between a five-minute triage and a thirty-second one."
- **The two files that produce NO alert.** This is counter-intuitive and therefore memorable — the demo of a scanner improvement is *silence*. Point at `vuln-03` and `vuln-04` in the file list, then point at the empty result in the alert list.
- **`vuln-03` uses `jq` without `-r`.** Say this explicitly: the values stay JSON-encoded, so they cannot break out and clobber `$GITHUB_OUTPUT`. Then add: "if I added `-r` to that command, this becomes a real finding again." That one sentence teaches the whole rule.
- **`vuln-04` and the removed query.** The file is unchanged; the scanner's opinion of it changed. That is the shape of every "we removed a query" change, and it is why references to query IDs are brittle.
- **`vuln-02` and the AND condition.** Untrusted source *plus* privileged context, from the *same* trigger. Both halves are present in that file, which is why it still fires.

## Expected result

| Specimen | Expected outcome | Why |
|---|---|---|
| `vuln-01-untrusted-checkout.yml` | **Alert present** | `pull_request_target` + checkout of `github.event.pull_request.head.sha` + executing from that checkout |
| `vuln-02-envvar-injection.yml` | **Alert present** (`envvar-injection/critical`) | Untrusted title written to `$GITHUB_ENV` **and** privileged trigger — both halves from the same trigger |
| `vuln-03-jq-output-clean.yml` | **NO alert** | False positive fixed in 2.26.3 — jq path filter output stays JSON-encoded |
| `vuln-04-self-hosted.yml` | **NO alert** | `codeql.actions.security.SelfHostedQuery` was **removed** in 2.26.3 |

The workflow itself should complete **green**. A green run with two alerts and two silences is success.

## Caveats / if it fails

- **Code scanning not enabled → 403 on upload.** This is the single most likely failure. The analyze step will run to completion and then fail uploading SARIF. Fix at `Settings` > `Code security` > `Code scanning`. **Verify this the day before.**
- **Permissions.** The workflow declares `security-events: write`, `contents: read`, `actions: read`. If the org or repo restricts the default `GITHUB_TOKEN` permissions, `security-events: write` may be denied. Check `Settings` > `Actions` > `General` > **Workflow permissions**.
- **Alerts can take a minute to appear** in the Security tab after the run goes green. Do not panic-refresh in front of the audience — dispatch the run *before* you start talking about the six changes, so the analysis is finishing while you present the context.
- **GHES audiences will not reproduce this.** If the customer's estate is GHES, state clearly that this is a github.com/GHEC behaviour today and reaches them in a future GHES release.
- **Alert paths render differently on narrow screens.** The path panel collapses. Widen the browser or zoom out before opening "Show paths" — the whole point of change #4 is visual.
- **Fallback if the live run fails:** run this workflow the day before and leave the resulting `Security` > `Code scanning` page open in a second tab, with the vuln-01 alert path already expanded. The alert list and the expanded path are the entire payload; a pre-baked tab is a completely adequate substitute.
- **Never "fix" the vuln specimens to make a demo pass.** If a specimen stops alerting, the interesting question is *why* — do not edit the file to force an alert. The vulnerable pattern must stay intact or the query cannot fire.
