# Demo 06 — Separate Actions path for Code Quality

**Changelog date:** 20 August 2026
**Demo type:** **Walkthrough only** — not demoable live

---

## What changed

GitHub Code Quality analysis has moved onto its **own Actions path**, separate from code scanning. Two strings changed:

| | Old (code scanning) | New (Code Quality) |
|---|---|---|
| **Actions path** | `dynamic/github-code-scanning/codeql` | `dynamic/github-code-quality/codeql` |
| **Actor** | `github-advanced-security` | `github-code-quality` |

Code Quality runs now attribute to the new path and the new actor. Nothing about your workflow files changes — this is how the platform reports and bills the analysis, not how you configure it.

## Why DXC should care

**Anything keyed on the old strings silently stops matching.** That is the whole risk, and "silently" is the operative word — nothing errors. A filter that used to match Code Quality runs now returns nothing, and a report that used to include them now excludes them. There is no warning; the number just gets quieter.

Concretely, check for the old strings in:

- **Billing reports and chargeback models.** If cost is allocated per team by parsing the Actions usage CSV and grouping on the workflow path, Code Quality minutes will fall out of that grouping and land in an "unattributed" bucket — or vanish from the model entirely.
- **Actions usage dashboards** (Power BI, Grafana, Looker, anything reading the usage export or the Actions usage API) filtering on `dynamic/github-code-scanning/codeql`.
- **Audit log queries and SIEM rules** filtering on `actor:github-advanced-security`. A rule that alerts on unexpected security-tool activity will now be blind to Code Quality runs, and may separately fire on `github-code-quality` as an *unknown* actor — a false positive on day one.
- **Automation that reacts to workflow runs by path** — cleanup jobs, retention scripts, run-cancellation logic.
- **Allowlists.** If an org restricts which actor identities may do certain things, `github-code-quality` may not be on the list.

**The fix is not to replace the old string — it is to match both.** Historical data still carries the old path and actor. A filter rewritten to only match the new string loses the past. Match both, indefinitely.

**Why this is a walkthrough and not a live demo:** reproducing it needs GHAS Code Quality enabled on the organisation *and* billing-report access at the org or enterprise level. Both are usually held by different people, and neither is something to be clicking through live on a customer tenant. The material is a before/after string comparison, which reads perfectly well from a slide and a sample CSV.

## Availability

| Where | Applies |
|---|---|
| github.com | Via GHEC / Team plans |
| GitHub Enterprise Cloud (GHEC) | **Yes** |
| GitHub Enterprise Server (GHES) | **No** — GitHub Code Quality is not available on GHES |
| Team | **Yes** |
| Enterprise | Yes (via GHEC) |
| Data residency | **Yes** — supported |

**Be explicit:** this applies to **GHEC, Team, and data residency deployments**. It is **not on GHES**. Along with topic 4 (coverage automation), this is one of two topics in this session that a GHES estate cannot use.

## Run the demo

There is no workflow to dispatch. This is a guided walkthrough — follow it in this order.

1. **Show the two strings side by side.** Put the before/after table (above) on screen. Two paths, two actors. That is the entire change.

2. **Show where the path appears in a billing CSV export.** Navigate:
   `Organization settings` > `Billing and licensing` > `Usage` > **Get usage report** / **Export**.

   *(Enterprise equivalent: `Enterprise settings` > `Billing and licensing` > `Usage`.)*

   The export arrives as a CSV by email or download.

3. **Open the CSV and point at the relevant columns.** The Actions usage export includes columns along the lines of:
   - `Date`
   - `Product` (Actions)
   - `Repository slug`
   - `Actions workflow` — **this is where `dynamic/github-code-scanning/codeql` appears, and where `dynamic/github-code-quality/codeql` now appears instead**
   - `Quantity` / `Unit type` / `Price per unit`

   Point at the **workflow** column. That string is what chargeback logic groups on.

   *(Exact column headers vary by export version. Confirm against your own export before the session.)*

4. **Show the actor in the audit log.** Navigate:
   `Organization settings` > `Archives` / `Logs` > **Audit log**, then search:
   ```
   actor:github-code-quality
   ```
   and compare against the historical:
   ```
   actor:github-advanced-security
   ```

5. **Give the audience the audit checklist.** These are the things to grep for across their tooling:

   ```
   dynamic/github-code-scanning/codeql
   github-advanced-security
   ```

   Search config and automation repositories:
   ```
   gh search code "dynamic/github-code-scanning/codeql" --owner <your-org> --limit 100
   gh search code "github-advanced-security" --owner <your-org> --limit 100
   ```

6. **State the remediation rule.** Do not swap the string — **match both**:

   ```
   workflow LIKE 'dynamic/github-code-%/codeql'
   ```
   or an explicit OR of the two literals. Historical rows keep the old value forever.

7. **Close on ownership.** This lands on whoever owns the FinOps/chargeback model and whoever owns SIEM rules — usually not the team that owns the workflows. Name those owners as the follow-up action.

## What to point out

- **Two strings. That is the whole change.** Resist expanding it — the value here is precision, not depth.
- **Nothing breaks loudly.** Emphasise this. There is no error, no failed run, no red X. A report just gets quieter, which is the hardest kind of defect to notice.
- **The workflow column in the CSV.** Point at the literal cell. Abstract descriptions of "billing attribution" do not land; a cell in a spreadsheet does.
- **The new actor may trip SIEM rules as an unknown identity.** This is the one that causes a 2am page. Call it out specifically.
- **Match both strings, forever.** Historical data does not get rewritten. Anyone who does a find-and-replace loses their history.
- **Who owns the fix.** The workflow authors have nothing to do. The people who need to act are FinOps and security operations — and they are usually not in the room for an Actions session. Tell the audience to carry the message.

## Expected result

This is a walkthrough, so "success" is comprehension rather than a green run. By the end the audience should be able to state:

- The old path was `dynamic/github-code-scanning/codeql` with actor `github-advanced-security`.
- The new path is `dynamic/github-code-quality/codeql` with actor `github-code-quality`.
- The strings appear in the **Actions usage / billing export** (workflow column) and in the **audit log** (actor).
- Filters must match **both** old and new, not just the new one.
- It applies to **GHEC, Team and data residency** — **not GHES**.

## Caveats / if it fails

- **This one genuinely cannot be demoed live in most environments.** It needs GHAS Code Quality enabled *and* org/enterprise billing access. Do not promise a live demo and then improvise.
- **Billing report access is org-owner or enterprise-billing-manager level.** A repository admin cannot export the usage report. If you do not have it, use a redacted sample CSV.
- **Usage exports are not real-time.** Data can lag by up to 24 hours, so a Code Quality run triggered during the session will not appear in an export pulled during the session.
- **CSV column headers vary between export versions.** The names in step 3 are indicative. **Pull an export yourself before the session and confirm the actual headers**, then read from your own file.
- **Audit log retention limits how far back you can show the old actor.** If retention is short, the historical `github-advanced-security` entries may already be gone — in which case show the new actor only and describe the old one.
- **Not reproducible on GHES at all.** Code Quality is not available there.
- **Fallback:** a slide with the before/after table plus a screenshot of a real (redacted) usage CSV showing the workflow column is a complete substitute. Given the access requirements, the prepared-screenshot version is arguably the *better* way to present this topic in front of a customer — you avoid opening a live billing page on a shared screen.
- **Do not open a live billing page on a shared screen** without checking what else is visible on it first. Usage reports contain spend data.
