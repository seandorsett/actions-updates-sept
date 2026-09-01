# GitHub Actions Office Hour — DXC, 8 September 2026

Runnable demos and presenter walkthroughs for six GitHub Actions changelog updates, built for the DXC GitHub Actions office hour on **8 September 2026**.

📊 **Presentation:** [`presentation/GitHub-Actions-Office-Hour-Sept-8.pptx`](presentation/GitHub-Actions-Office-Hour-Sept-8.pptx)

---

## Topics

| # | Topic | Changelog date | Demo type | Availability | Demo folder |
|---|---|---|---|---|---|
| 1 | Actions retention now covers checks, workflow runs and statuses | 27 Aug 2026 | **Live demo** | github.com, GHEC, GHES, all plans | [`demos/01-retention`](demos/01-retention/README.md) |
| 2 | Windows 11 arm64 with Visual Studio 2026 is GA | 20 Aug 2026 | **Live demo** | github.com, GHEC — **not GHES** | [`demos/02-windows-arm64`](demos/02-windows-arm64/README.md) |
| 3 | CodeQL 2.26.3 | 19 Aug 2026 | **Live demo** ⭐ | github.com, GHEC — **GHES in a later release** | [`demos/03-codeql`](demos/03-codeql/README.md) |
| 4 | Code coverage automatic enablement | 4 Aug 2026 | **Live demo** (public preview) | GHEC, Team — **not GHES** | [`demos/04-coverage-automation`](demos/04-coverage-automation/README.md) |
| 5 | More control over hosted runners | 25 Jun 2026 | **Live demo** | GHEC — **Team and Enterprise only**, not GHES | [`demos/05-runner-controls`](demos/05-runner-controls/README.md) |
| 6 | Separate Actions path for Code Quality | 20 Aug 2026 | **Walkthrough** | GHEC, Team, data residency — **not GHES** | [`demos/06-code-quality-path`](demos/06-code-quality-path/README.md) |

**Five live demos, one walkthrough.** Topic 6 requires GHAS Code Quality plus org-level billing access and is not safely demoable on a customer tenant.

### GHES gaps to flag explicitly

If any part of the DXC estate runs GitHub Enterprise Server, be clear that **topics 2, 4, 5 and 6 do not apply there today**, and topic 3 (CodeQL 2.26.3) arrives in a future GHES release rather than being live now.

---

## ⚠️ SAFETY — read before running anything

This repository contains **four intentionally vulnerable workflow files**:

```
.github/workflows/vuln-01-untrusted-checkout.yml
.github/workflows/vuln-02-envvar-injection.yml
.github/workflows/vuln-03-jq-output-clean.yml
.github/workflows/vuln-04-self-hosted.yml
```

**These are CodeQL demo specimens. They exist only so that CodeQL has something to analyse in Demo 03.**

- **Every job in every one of these files carries `if: ${{ false }}`.** They are permanently disabled and can never execute.
- The vulnerable patterns themselves (the `pull_request_target` trigger, the untrusted expressions, the writes to `$GITHUB_ENV`) are **deliberately left intact**. Removing them would stop the CodeQL queries firing and destroy the demo. The `if: ${{ false }}` guard is what makes them safe — not sanitisation of the pattern.
- **Never remove the `if: ${{ false }}` guards. Never enable these workflows. Never copy these patterns into a real repository.**
- Each file opens with a comment block reading `INTENTIONALLY VULNERABLE - DEMO SPECIMEN - NEVER EXECUTES (guarded by if: false) - exists so CodeQL has something to analyze`.

If you fork or copy this repository, these files come with it. Treat them accordingly.

---

## Prerequisites

Confirm all of these **before the session**, not during it.

| Requirement | Needed for | How to check |
|---|---|---|
| **`gh` CLI installed and authenticated** | All dispatched workflows | `gh auth status` |
| **Actions enabled on the repository** | All live demos | `Settings` > `Actions` > `General` > Allow all actions (or a permitting allowlist) |
| **Code scanning enabled** | Demo 03 (CodeQL) | `Settings` > `Code security` > **Code scanning** — without this the analyze step fails with a 403 |
| **Repository admin rights** | Demo 01 (retention setting) | `Settings` > `Actions` > `General` |
| **Organisation or enterprise admin rights** | Demo 05 (runner groups) | `Organization settings` > `Actions` > **Runner groups** — a repo admin cannot do this |
| **Team or Enterprise plan** | Demo 05 | Runner group settings do not exist on Free/Pro |
| **Node.js 18+ and npm** | Demo 04 (coverage) | `node --version` && `npm --version` — authored against Node 22 |
| **`npm install` already run** | Demo 04 | `npm test` must pass before you present |
| **Windows arm64 hosted runners available** | Demo 02 | Dispatch `demo-02-windows-arm64.yml` once the day before — these are billable and capacity-limited |
| **Org/enterprise billing access** | Demo 06 (walkthrough) | `Organization settings` > `Billing and licensing` > `Usage` |

---

## Quick start

```bash
# Clone
gh repo clone seandorsett/actions-updates-sept
cd actions-updates-sept

# Demo 04 prerequisite - install and verify the test suite
npm install
npm test          # expect: 2 suites, 11 tests, all passing
```

Dispatch each runnable workflow:

```bash
# Demo 01 - retention artifacts (artifact + commit status + logs)
gh workflow run demo-01-retention.yml

# ...or with an explicit retention value
gh workflow run demo-01-retention.yml -f retention_days=7

# Demo 02 - Windows 11 arm64, VS2026 vs legacy label
gh workflow run demo-02-windows-arm64.yml

# Demo 03 - CodeQL analysis of the workflow files
gh workflow run demo-03-codeql.yml

# Demo 05 - runner labels and groups
gh workflow run demo-05-runner-labels.yml

# Follow whichever you just started
gh run watch
```

**Equivalent UI path for any of the above:** `Actions` tab > select the workflow in the left sidebar > **Run workflow** > **Run workflow**.

Demos **04** and **06** have no workflow to dispatch — that is deliberate in both cases. See their READMEs.

---

## Suggested running order

This matches the presentation flow. It front-loads the strongest demo's *setup* so the analysis is completing while you talk.

| Order | Topic | Why here | Approx. time |
|---|---|---|---|
| **0** | *(Pre-flight)* Dispatch `demo-03-codeql.yml` | It takes 1–3 minutes plus alert-surfacing time. Start it before you start talking. | — |
| **1** | **Topic 1 — Retention** (`demos/01-retention`) | Opens on a hard date (1 October) and a renamed setting. Concrete, affects everyone, no prerequisites. | ~8 min |
| **2** | **Topic 2 — Windows arm64 / VS2026** (`demos/02-windows-arm64`) | The breaking change with a deadline. Two version numbers side by side — visually immediate. | ~8 min |
| **3** | **Topic 3 — CodeQL 2.26.3** ⭐ (`demos/03-codeql`) | The strongest demo. Your run from step 0 is now finished and the alerts are in the Security tab. | ~15 min |
| **4** | **Topic 4 — Coverage automation** (`demos/04-coverage-automation`) | Enable it early in this slot; the PR takes a few minutes to appear. Fill the gap with the "why" while it generates. | ~10 min |
| **5** | **Topic 5 — Runner controls** (`demos/05-runner-controls`) | Two-run demo with a settings change in between — needs the most wall-clock time, so it sits after the quick wins. | ~10 min |
| **6** | **Topic 6 — Code Quality billing path** (`demos/06-code-quality-path`) | Walkthrough. A clean, low-risk closer that hands the audience a concrete action item to take away. | ~5 min |

**Timing notes**

- Steps 0, 3 and 4 all have latency. Start each one *before* you need its output.
- Topic 5 changes a shared organisation setting. **Re-enable `ubuntu-latest` afterwards** — put it on your post-session checklist.
- If you are short on time, topic 6 reads perfectly well from the slide alone.

---

## Repository layout

```
README.md                                        <- you are here
presentation/
  GitHub-Actions-Office-Hour-Sept-8.pptx         <- the deck
.github/workflows/
  demo-01-retention.yml                          <- Topic 1, dispatch only
  demo-02-windows-arm64.yml                      <- Topic 2, dispatch only
  demo-03-codeql.yml                             <- Topic 3, dispatch + push/PR on main
  demo-05-runner-labels.yml                      <- Topic 5, dispatch only
  vuln-01-untrusted-checkout.yml                 <- CodeQL specimen, NEVER RUNS
  vuln-02-envvar-injection.yml                   <- CodeQL specimen, NEVER RUNS
  vuln-03-jq-output-clean.yml                    <- CodeQL specimen, NEVER RUNS
  vuln-04-self-hosted.yml                        <- CodeQL specimen, NEVER RUNS
demos/
  01-retention/README.md
  02-windows-arm64/README.md
  03-codeql/README.md
  04-coverage-automation/README.md
  05-runner-controls/README.md
  06-code-quality-path/README.md
src/
  calculator.js                                  <- Topic 4 sample source
  stringUtils.js
test/
  calculator.test.js                             <- 11 passing jest tests
  stringUtils.test.js
package.json                                     <- jest, NO coverage config (deliberate)
```

**There is no coverage workflow and no coverage configuration.** That absence is the point of Demo 04 — GitHub generates it and opens a pull request.

---

## Each demo README contains

Every file under `demos/` follows the same structure, so you can navigate any of them the same way while presenting:

1. Title and changelog date
2. **What changed** — plain language
3. **Why DXC should care** — practical impact
4. **Availability** — github.com / GHEC / GHES / Team / Enterprise, stated explicitly
5. **Run the demo** — numbered, literal, click-by-click, with exact UI paths and `gh` commands
6. **What to point out** — what the audience should look at on screen
7. **Expected result** — so a failed demo is obvious immediately
8. **Caveats / if it fails** — prerequisites, permissions, and a fallback
