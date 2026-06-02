# Copilot Instructions

**HubWorks** — Collection of GitHub Copilot Skills, Agents, and Prompts created by Innovation Hub SEs for the purpose of end-to-end Agentic Workflow Automation.

## Setup

```bash
python setup.py          # Interactive: config, dependencies, VS Code settings
```

Config lives in `config.json` (gitignored) with one key: `engagements_base_path` pointing to the OneDrive Engagements folder.

### MCP Servers

- **WorkIQ** (`@microsoft/workiq`) — M365 data access (emails, meetings, documents). Required for closeout, follow-up email, and journey promoter skills.
- **MSX-MCP** (`copilot plugin install mcaps-microsoft/MSX-MCP`) — Microsoft sales and MCAPS data. Highly recommended. Requires Azure CLI (`az login`). See [MSX-MCP repo](https://github.com/mcaps-microsoft/MSX-MCP).
- **Power BI** (remote HTTP) — Fabric Power BI MCP for Hub Insights trend reports.
- **SharePoint** (`agency mcp sharepoint`) — SharePoint site/library access. Requires [Agency CLI](https://aka.ms/agency).
- **Mail** (`agency mcp mail`) — Outlook mail access. Requires Agency CLI.
- **Teams** (`agency mcp teams`) — Teams messaging. Requires Agency CLI.
- **Calendar** (`agency mcp calendar`) — Outlook calendar access. Requires Agency CLI.

## MCP Tool Selection

This toolkit includes multiple MCP servers. Choosing the right one for each task is critical for performance. The wrong choice can make operations 10-50x slower than necessary.

### Decision Order

When you need information, follow this priority:

1. **Local files first** — Check the engagement folder, session context, and workspace files. If the data is already there, use it.
2. **WorkIQ second** — For lookups, summaries, meeting context, and search. WorkIQ is fast and returns synthesized answers.
3. **Agency MCP tools last** — Only when you need capabilities that local files and WorkIQ cannot provide.

### When to Use Agency MCP Tools (mail, teams, calendar, sharepoint)

Use these tools **only** for their differentiated capabilities:

**Writing / Drafting (creating new items):**
- **mail**: Drafting and sending emails
- **teams**: Sending Teams messages
- **calendar**: Creating or updating calendar events
- **sharepoint**: Uploading files, creating list items

**Full structured data retrieval (when you need the raw JSON, not a summary):**
- **mail**: Fetching full email threads with headers, attachments, and metadata
- **teams**: Pulling complete channel message threads with reactions and replies
- **calendar**: Getting detailed event objects with attendees, recurrence, and response status
- **sharepoint**: Browsing document libraries, downloading files, reading list item fields

### When NOT to Use Agency MCP Tools

- **"Who was in the meeting?"** — Use WorkIQ, not calendar
- **"What did we discuss?"** — Use WorkIQ, not teams
- **"What's the customer's background?"** — Check local engagement files first, then WorkIQ
- **"Find the planning call transcript"** — Use WorkIQ
- **"What emails have we exchanged?"** — Use WorkIQ for the summary; only use mail MCP if you need the full raw email content
- **"When is the engagement?"** — Check engagement_metadata.json first, then WorkIQ

### Why This Matters

WorkIQ returns a focused answer in one call. The Agency MCP tools require multiple paginated API calls to browse, filter, and retrieve content — each call has network latency and auth overhead. A WorkIQ query that takes 3 seconds could take 30+ seconds via raw MCP tool calls.

**Rule of thumb:** If you're looking something up, use WorkIQ. If you're creating something or need the complete raw data structure, use the Agency MCP tools.

## Architecture

### Skill Structure

All skills live under `.github/skills/`. Each skill is self-contained:

```
.github/skills/[skill-name]/
├── SKILL.md              # Metadata frontmatter + full documentation (triggers, workflow, rules)
├── scripts/              # Python implementation
├── references/           # Guides, agent instructions, templates
├── assets/               # DOCX templates, example JSON, images
└── requirements.txt      # Python deps (optional; some skills auto-install)
```

### Skills

| Skill | Purpose | Key Output |
|-------|---------|------------|
| **engagement-initiator** | Create engagement folder + task timeline | `tasks.csv`, `engagement_metadata.json` |
| **agenda-builder** | Transform transcript → professional DOCX agenda | `.docx` via `scripts/core.py` |
| **journey-promoter** | Promote single engagement → multi-session journey | Renamed folder, `sessions_log.json` |
| **engagement-closeout** | Generate CE Hub closeout from transcripts (needs WorkIQ) | `closeout_summary_[date].md` |
| **followup-email** | Draft audience-calibrated follow-up email (needs WorkIQ) | `followup_email_[date].html` |
| **code-app-builder** | Scaffold Power Apps Code App (React 19 + Vite 6 + TS) | Full project with mock Dataverse services |
| **task-generator** | Business-day-aware task timelines for Planner | `tasks.csv` (initial) or `tasks_[date].csv` (follow-on) |
| **cehub-account-search** | Search CEHub Dataverse for accounts and engagements by TPID/account number | Formatted table or JSON of account/engagement records |
| **cehub-my-engagements** | List completed Innovation Hub engagements for any user, grouped by customer | Formatted table or JSON of engagements by customer |
| **customer-insights** | Pre-briefing customer HTML report from Power BI + MSX + WorkIQ (qualification calls) | Self-contained HTML report (exec / engagement / deep-dive tabs) |
| **cet-catalog-search** | Search the CET Content Catalog with multi-axis query expansion | Structured table of experiences, demos, EPs from CEContent |
| **hub-insights** | Unified Hub Insights report — SA and SU trends with LLM analysis | Branded `.pptx` deck (themes, outcomes, gaps, compete) |
| **skill-docs-generator** | Generate Jekyll docs page from a skill's SKILL.md | `docs/_skills/[name].md` |
| **issue-triage** | AI-powered GitHub issue classification, labeling, and triage reports | Triage summary table, labels applied |
| **release-summary** | Announce merged PRs to Teams channel (on-demand + scheduled) | Teams message to Innovation Hub Community |

### CEHub Dataverse Skills

Use these skills whenever the user asks to look up, search, or retrieve data directly from **CEHub** (`cehub-prod.crm.dynamics.com`). Authentication is handled via interactive browser login (MSAL); tokens are cached at `~/.copilot/cehub_token_cache.bin`.

| Task | Skill to Use |
|------|-------------|
| Look up a customer account in CEHub by TPID, account number, or GUID | **cehub-account-search** |
| List engagements for a customer account | **cehub-account-search** (`engagements` subcommand) |
| Run an arbitrary OData filter against CEHub | **cehub-account-search** (`query` subcommand) |
| Show my engagements / engagement history for a user | **cehub-my-engagements** |
| Discover available columns on a CEHub entity | **cehub-account-search** (`discover` subcommand) |

#### CEHub Script Paths

```bash
# Account/engagement search
python .github/skills/cehub-account-search/scripts/search_accounts.py <subcommand> [options]

# User engagement history
python .github/skills/cehub-my-engagements/scripts/my_engagements.py [user] [options]
```

Install dependencies before first use:
```bash
pip install -r .github/skills/cehub-account-search/requirements.txt
pip install -r .github/skills/cehub-my-engagements/requirements.txt
```

### Engagement Lifecycle

Initiate → Build Agenda → Execute → Closeout → Follow-Up Email → (optionally) Promote to Journey → Follow-On Sessions

### Key Patterns

- **SKILL.md is the source of truth** for each skill's behavior, rules, and output schemas. Always read it before modifying a skill.
- **Preview-then-commit**: Agenda builder requires user approval before generating DOCX. Other skills with structural changes also use approval gates.
- **Business day calculations**: All task timelines exclude weekends. Core logic in `task-generator/scripts/business_days.py`.
- **Auto-install dependencies**: `agenda-builder/scripts/core.py` detects and pip-installs missing packages at import time.
- **Metadata chaining**: Skills read each other's output files (`engagement_metadata.json`, `agenda_data.json`, `closeout_summary_*.md`) for context.

## Commands

### Task Generator
```bash
# Initial engagement (15 tasks, T-28 to T+3)
python .github/skills/task-generator/scripts/business_days.py "Customer Name" "YYYY-MM-DD"

# Journey follow-on session (14 tasks, T-21 to T+3)
python .github/skills/task-generator/scripts/business_days.py "Customer Name" "YYYY-MM-DD" --followon --label "Session 2 - Topic"
```

### Agenda Builder (Python one-liner from engagement folder)
```bash
python -c "import json, sys; sys.path.insert(0, r'<SKILLS_PATH>/.github/skills/agenda-builder'); from scripts.core import create_agenda_doc; data = json.load(open('agenda_data.json')); create_agenda_doc(data, r'<SKILLS_PATH>/.github/skills/agenda-builder/assets/agenda_template.docx', 'output.docx', None)"
```

### Code App Builder
```bash
npm install && npm run build   # Must produce 0 errors
npm run dev                    # Dev server
npm run lint                   # ESLint
```

### Hub Insights

Generates branded PowerPoint trend reports from Power BI engagement data. Supports two trend types:

| Trend Type | Scope | Script Path |
|-----------|-------|-------------|
| Solution Area (SA) | SA-level outcomes, gaps, compete | `scripts/sa/run_pipeline.py` |
| Sales Unit (SU) | SU-level themes, outcomes, gaps | `scripts/su/generate_pptx_python.py` |

**Workflow:** Scope → Power BI export → Cache → Corpus extraction → Dynamic seed generation → Pass 1 extraction → LLM summaries → PPTX generation.

Key files: `SKILL.md` (master workflow), `references/DAX_QUERIES.md` (column contracts), `references/ANALYSIS_GUIDE.md` (LLM analysis spec), `references/outcome_seed_bank.json` (SA baseline seeds).

```bash
# Install deps
pip install -r plugins/hub-insights/skills/hub-insights/requirements.txt

# SA corpus extraction
$env:PYTHONIOENCODING="utf-8"
python plugins/hub-insights/skills/hub-insights/scripts/sa/extract_corpus_samples.py

# SU corpus extraction
python plugins/hub-insights/skills/hub-insights/scripts/su/extract_su_corpus_samples.py
```

## Code App Builder Gotchas

These are documented in `code-app-builder/references/pitfalls.md`:
- `vite.config.ts`: must use `base: './'` (relative paths, not absolute)
- `main.tsx`: must use `HashRouter` (not `BrowserRouter` — breaks in iframe)
- `@microsoft/power-apps-vite`: use named import `{ powerApps }`, not default import
- Data layer: 4 files per entity (Model → Generated Service → Types → Service Wrapper)

## File Naming Conventions

- Engagement folders: `[Customer]-YYYY-MM-DD` or `[Customer]-YYYY-Customer-Journey`
- Generated outputs: `closeout_summary_[date].md`, `followup_email_[date].html`, `tasks_[date].csv`
- Agenda data: `agenda_data.json` (intermediate JSON consumed by `core.py`)

## Contributing

- Fork the repository rather than creating branches
- For non-trivial changes, submit an issue first to discuss the approach

## Plugin-Specific Memory Layers

Some plugins ship their own L1 *Memory Layer* under `plugins/<name>/skills/<name>/memory/`.
When working on files under such a plugin, treat that plugin's `memory/architecture.rules.md`
as **binding** — its invariants override generic guidance in this file.

Currently registered:

| Plugin | Memory file | Summary |
|---|---|---|
| `hub-business-audit` | `plugins/hub-business-audit/skills/hub-business-audit/memory/architecture.rules.md` | Read-only by construction; MSX is truth (not CEHub); all artifacts under `audit_workspace`; SKILL.md ≤ 250 lines; deterministic fiscal/hub math (no LLM guessing). |

If you are about to edit any file under `plugins/hub-business-audit/`, read that plugin's
`memory/architecture.rules.md` and `memory/project.md` first.

## Skill Conflict Check

At the start of every conversation, check `~/.innovation-hub/.toolkit_installed`. If `setup_steps_completed.skills_trimmed` is missing or false, inform the user: "HubWorks can disable conflicting skills to reduce noise. Say **'trim skills'** or **'set up the toolkit'** to clean up."

Similarly, if `setup_steps_completed.instructions_deployed` is missing or false, inform the user: "HubWorks has starter instructions for better Copilot behavior. Say **'set up the toolkit'** to deploy them."

If either flag is set to `"skipped"`, do not prompt again.