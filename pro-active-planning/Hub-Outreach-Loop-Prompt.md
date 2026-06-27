# 🔁 Hub Priority-Account & SE Outreach — Agentic Loop Prompt
**For: GitHub Copilot CLI**  ·  **Owner: Mark Franco (Sr Solution Engineer, Americas Innovation Hub)**

You are an autonomous agent. Run the **DISCOVER → PLAN → EXECUTE → VERIFY → ITERATE** loop below until every deliverable passes its Done check. Do not stop to ask questions if a reasonable, grounded default exists — figure it out, log the assumption, and keep going.

---

## 0️⃣ PREREQ CHECK — run this first (before DISCOVER)
This is a long-running task that depends on several skills/MCP servers being installed **and** authenticated. **Before doing anything else**, verify each prerequisite below and print a status line to screen using ✅ (ready) or ❌ (missing/unauthenticated). Do **not** start the loop until all checks are ✅.

Run these checks in parallel where possible:

| # | Prereq | How to check | Pass = ✅ |
|---|---|---|---|
| P1 | **WorkIQ** authenticated | Run a quick `who am I` / "what is my name and role?" prompt against WorkIQ | Returns the signed-in user's identity (not an auth/EULA error) |
| P2 | **CEHUB** skill available | Confirm the CEHUB skill/tooling is installed and reachable | Skill responds / token cache present |
| P3 | **MSX** skill available | Confirm the MSX skill/MCP is installed and `az login` session is valid | Returns account data on a test lookup |
| P4 | **Priority Accounts source** | Confirm `Mark Franco - Priority Accounts.xlsx` is locatable | File found |
| P5 | **Output tooling** | Confirm ability to write files and generate `.pptx` (python-pptx or equivalent) | Available |

**Print the result exactly like this (one line each):**

```
PREREQ CHECK
  ✅ WorkIQ        — authenticated as {display name}
  ✅ CEHUB         — skill available
  ❌ MSX           — not authenticated (run: az login)
  ✅ Priority XLSX — found at {path}
  ✅ Output tools  — python-pptx available
```

**Done check:** Every prereq prints ✅. If **any** prints ❌, **stop**, show the user the exact remediation step (e.g., `az login`, accept WorkIQ EULA, install the missing skill), and wait — do not proceed to DISCOVER until resolved.

---

## 🎯 Goal (one sentence)
Produce a complete Hub outreach package — collected App Innovation one-pagers, **draft-only** emails to each priority account's AE + ATS, and a 2-slide PowerPoint — all grounded in real data pulled from the available skills, and saved into a single organized folder.

## 🚧 Hard guardrails (never violate)
1. **NEVER send email.** Create **drafts only**. No `send`, no auto-send, no calendar invites.
2. **Never fabricate** names, numbers, emails, pipeline figures, or engagement outcomes. If a value can't be retrieved, insert a clearly-marked `[confirm: …]` placeholder.
3. **Resolve, don't guess.** Every person → real directory email before use. Every account → real MSX record.
4. Save all deliverables under one root folder (default: `./Mark-Franco-Hub/`) in subfolders `One-Pagers/`, `Draft-Emails/`, `Presentation/`, `_Account-Data/`.
5. Log every assumption and every skill call you make to `_Account-Data/run-log.md`.

## 🧰 Skills available (use these first, before web or generic knowledge)
| Skill | Use it for |
|---|---|
| **WorkIQ** | Org/work context — who's on the Hub SE team, managers, roles, account assignments, recent work artifacts. |
| **CEHUB** | Customer Engagement Hub — engagement records: lead architect, status (completed/in-flight), outcomes, NSAT, solution area. |
| **MSX** | Account details + **opportunities/pipeline by account** (account name, TPID, segment, opportunity name, est. revenue, stage). |

---

## 1️⃣ DISCOVER — work out what needs doing
Gather everything before building. Run these in parallel where possible:

- **D1. Priority accounts** — locate Mark's priority-accounts spreadsheet (`Mark Franco - Priority Accounts.xlsx`). Extract per account: **Account Executive (AE)**, **Account Technology Strategist (ATS)**, CSAM, relevant technical team, and the "next step" note. This sheet is the **source of truth** for which accounts get outreach.
- **D2. One-pagers** — find the current **App Innovation one-pagers** (FY26/current). They live in the Hub offerings library and are typically **last edited by Ali Mazaheri**. Collect the offering one-pagers + the reusable template.
- **D3. Opportunities (MSX)** — for each priority account, pull the **top 3 opportunities by revenue** (name, solution area, est. revenue) plus account-level pipeline/ACR.
- **D4. Engagement outcomes (CEHUB)** — pull the **last engagement (lead + completed status)** for each Hub architect listed in the Email Spec below — **one outcome per architect**.
- **D5. SE roster** — from WorkIQ, build the roster of Hub Solution Engineers and their manager(s) — for Slide 2.

**Done check:** You can name, for every priority account, its AE+ATS (with emails), its top-3 MSX opportunities, and you have one CEHUB outcome per architect. Gaps are explicitly logged as `[confirm: …]`.

## 2️⃣ PLAN — decide how to do it
- Map each account → {AE email, ATS email, top-3 opps, next-step note}.
- Resolve every AE/ATS display name to a directory email (note ambiguous matches).
- Decide folder layout and file names. Draft the email template (see Email Spec) and the 2-slide deck outline.
- Exclude accounts not on the spreadsheet; flag accounts on the sheet that lack an AE/ATS (no draft — list them instead).

**Done check:** A written plan in `run-log.md` listing each deliverable, its data sources, and any unresolved items.

## 3️⃣ EXECUTE — do the work
- **E1. One-Pagers/** — save the collected App Innovation one-pagers + template, plus an `_INDEX.md` (file, author/last-editor, source link).
- **E2. Draft-Emails/** — create **one draft per priority account** (drafts only), addressed To the resolved **AE + ATS**, personalized greeting + the account's "next step" note. Body = the three sections in the Email Spec.
- **E3. Presentation/** — build the 2-slide PPTX (spec below).
- **E4. _Account-Data/** — write the consolidated workbook (account, segment, TPID, pipeline, AE+email, ATS+email, next step) and the SE roster.

## 4️⃣ VERIFY — check it against the goal
- ✅ No email was sent (all items are drafts).
- ✅ Every draft's To = real AE + ATS emails; greeting personalized; 3 sections present; opportunities filled from MSX (or flagged).
- ✅ Customer-outcomes section has exactly **one CEHUB outcome per architect**, each traceable to a CEHUB record.
- ✅ One-pagers present and indexed; deck renders (convert slides → images and eyeball them).
- ✅ Every number/name traces to a skill result; placeholders are clearly marked.
- ✅ All files exist under the root folder.

## 5️⃣ ITERATE — not there yet? feed it back in
For any failed VERIFY check: return to the earliest pillar that owns the gap (missing opp → DISCOVER D3; wrong email → PLAN; broken slide → EXECUTE E3), fix, and re-run VERIFY. Repeat until all checks pass. Then write a final summary + the "before you send" list.

---

## ✉️ Email Spec (per account — DRAFT ONLY)
**Subject:** `Partnering the Innovation Hub with the {Account} account team`
**To:** {AE email}, {ATS email}   ·   **Greeting:** `Hi {AE first} and {ATS first},`
Open with the recurring-cadence ask + the account's **next-step note** from the spreadsheet. Then:

### Section 1 · The one-pagers we run in the Hub
List the App Innovation / Hub engagement one-pagers (envisioning → architecture → rapid prototype → hackathon) + link to the live library.

### Section 2 · Recent customer outcomes  ⬅️ **CHANGED — pull from CEHUB**
Use the **CEHUB skill** to pull each architect's **last engagement** (lead architect + completed status) and surface **one engagement outcome per architect**. Render as a short list, one line each, attributed to the architect and customer, with the outcome and (if available) NSAT/solution area. Architects:

- **Mark Franco**
- **Ansar Mohamad**
- **Carlos Rocchetti**
- **Jordan Dowdall**
- **Winner Emoto**

> For each: `{Architect} — {Customer}: {outcome} ({status}, {solution area / NSAT})`. If CEHUB returns no completed engagement for an architect, show their most recent engagement and mark status, or insert `[confirm: latest CEHUB engagement]`. **Do not invent outcomes.**

### Section 3 · Top opportunities — {Account}
From **MSX**, list the **top 3 opportunities by revenue** for the account (name · solution area · est. revenue) and the account-level pipeline/ACR. If opportunity-level detail isn't available, show account pipeline and flag the top-3 as `[confirm in MSX]`.

**Close:** offer to send a short recurring invite + bring the relevant one-pagers. Sign as Mark Franco.

---

## 🖥️ Deck Spec (2 slides)
- **Slide 1 — Priority Accounts:** table of accounts (segment + MSX pipeline), the content link being shared, and the regular-engagement cadence (recurring sync → account planning → map one-pager to top opp → run engagement → record outcome in MSX).
- **Slide 2 — SE Manager Outreach:** Hub SE roster (from WorkIQ), targeted at their manager(s); same body as the account emails **except** the opportunities section is replaced with **"New Demos & Experiences"** (current Hub demos/experiences to bring to the team).

---

## ✅ Definition of Done
All VERIFY checks pass, the folder contains one-pagers + indexed, N account drafts (drafts only) with real AE/ATS recipients and CEHUB-sourced outcomes, the 2-slide deck, and the consolidated data — and `run-log.md` lists every assumption, every skill used, and the short **"before you send"** checklist (e.g., confirm any ambiguous ATS, confirm MSX top-3).
