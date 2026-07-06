# Hub Outreach Run Log — Mark Franco

**Run date:** 2026-06-27 · **Owner:** Mark Franco (Sr Solution Engineer, Americas Innovation Hub)
**Root:** `./Mark-Franco-Hub/`

## PREREQ CHECK
- ✅ WorkIQ — authenticated as Mark Franco (Sr Solution Engineer Hub)
- ✅ CEHUB — skill available (`cehub-my-engagements`, token cache present)
- ✅ MSX — authenticated as marfra@microsoft.com (Dataverse connected)
- ✅ Priority XLSX — found at `C:\Users\marfra\OneDrive - Microsoft\Mark Franco - Priority Accounts.xlsx`
- ✅ Output tools — python-pptx 1.0.2 + openpyxl

## Skill calls made
| Skill | Call | Purpose |
|---|---|---|
| WorkIQ | `ask` (identity) | Confirm signed-in user |
| WorkIQ | `ask` (Priority Accounts xlsx) | Read source-of-truth sheet — file is **sensitivity-label encrypted (IRM/DRM)**; could not open locally with openpyxl, read via WorkIQ instead |
| WorkIQ | `ask` x3 | Resolve 15 AE/ATS directory emails + SE roster + 2 gap names |
| MSX | `get_account_overview` (via @msx agent, 8 accounts) | TPID, segment, pipeline, top-3 opps by revenue |
| CEHUB | `my_engagements.py` x5 architects | Last completed engagement per architect |

## Priority accounts (source of truth — 8 accounts)
BMO, Constellation Software, Government of Ontario, Metrolinx, RBC, Saputo, WSIB, WSP.
Rows after WSP on the sheet (ESDC, PSPC, guidance text) are not structured account records — excluded.

## Deliverables
- `One-Pagers/` — 4 App Innovation one-pagers + template + `_INDEX.md`
- `Draft-Emails/` — 8 HTML drafts (one per account), **drafts only — nothing sent**
- `Presentation/` — `Priority Accounts & SE Outreach - FY26.pptx` (2 slides)
- `_Account-Data/` — `master-data.json`, consolidated workbook, SE roster workbook, raw CEHUB JSON

## Assumptions logged
1. Architect engagements pulled are the most recent **Complete** customer-facing CEHUB records (internal "Travel Time" blocks skipped). Solution area / NSAT not exposed by the engagements script → marked `[confirm]`.
2. Outcome text uses the engagement title/type as delivered — **no outcomes invented**.
3. SE roster scoped to the 5 named architects (all report to Laurie Roseland-Barnes); WorkIQ found no additional fully-verified members.
4. MSX figures are open-pipeline USD base as of 2026-06-27; per-opp revenue may be in transaction currency (CAD) — noted inline.

## Outlook drafts status
Attempted to create the 8 emails as real Outlook drafts via the mail MCP (`CreateDraftMessage`, drafts only). **All calls timed out** (Agency mail connector unresponsive on 2026-06-27, including trivial draft-list reads). The 8 HTML files in `Draft-Emails/` are intact. **Outlook drafts still need to be created** once the mail connector responds — verify the Drafts folder for any partial creations first to avoid duplicates.

## ⚠️ Before-you-send checklist
- [ ] **Saputo ATS** — confirm Michael Beauchamp's directory email (no Microsoft Canada match found).
- [ ] **WSP AE** — confirm Emily Zarlenga (medium-confidence match for sheet spelling "Zarelenga").
- [ ] **RBC** — confirm Canadian parent TPID 521024 (not RBC Europe 1540192).
- [ ] **BMO top-3** — de-dupe the three near-identical "BMO Life sapiens" records in MSX.
- [ ] **Government of Ontario** — no next-step note on sheet; confirm the intro ask.
- [ ] Confirm CEHUB solution area / NSAT for each architect outcome before sending.
