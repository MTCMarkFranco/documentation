---
name: customer-story-writer
description: Writes and reviews Innovation Hub customer stories for the Hub Customer Story Template. Use when drafting, editing, or reviewing customer stories, or when user says "write a story", "customer story", "review my story", "story for [customer]", or "Hub story". Also triggers on requests to score stories against Manish's rubric.
---

# Customer Story Writer

Draft Hub customer stories into the three-column template format (Business Objectives, Hub Strategy, Solution and Outcomes), score them against Manish's 3-point rubric, and reframe for different audiences.

## Workflow

1. Gather source material from the engagement folder — read `closeout_summary_*.md`, `engagement_metadata.json`, and `qualification_notes.md`
2. **Assess what's available vs what's missing** before drafting — see [Gap Analysis](#gap-analysis) below
3. Draft each column following the principles below
4. Flag any gaps that prevent a 3/3 score and suggest how to close them
5. Present draft for user review
6. Export — Slidev for preview/iteration, editable PPTX via the `pptx` skill for formal sharing

## Gap Analysis

Before writing, check whether the source material can support a 3/3 story. If not, tell the user what's missing and how to get it.

| What you need | Where to find it | If it's missing |
|---|---|---|
| Specific team names and their problems | Closeout summary, qualification notes | Ask the user: "Which teams were affected? What were their specific pain points?" |
| Customer-set KPIs with numbers | Closeout outcomes, WorkIQ transcript | Ask: "Did the customer commit to measurable targets? Who can we follow up with for metrics?" |
| Measured before/after results | Follow-up emails, customer contacts | Flag: "Story scores 2.5 without hard 'after' data. Suggest following up with [contact] for measured outcomes." |
| Microsoft revenue impact | MSX pipeline, closeout summary | Query MSX or ask: "Are there opportunities tied to this engagement in MSX?" |
| Cross-Hub or cross-team coordination | Journey notes, Teams chats | Ask: "Did other Hubs, GBBs, or partners contribute?" |
| Follow-on engagement demand | engagement_metadata.json sessions array | Check for planned sessions — these strengthen the strategy narrative |

**Don't draft a story with known gaps and then score it low.** Surface the gaps first and help the user close them.

## Business Objectives Column

Describe specific, discovery-driven business challenges in the customer's own language.

- **Be specific, not generic.** Each bullet should contain a concrete detail (a metric, a team name, a process description) that proves this came from deep discovery, not a 15-minute call.
- **No Microsoft products.** This column is the customer's world — describe problems in their language, not ours.
- **Broader context goes last.** If the engagement fits into a larger account strategy (global initiative, multi-Hub coordination, renewal timeline), put that framing in a closing paragraph — not the lead bullet. Lead with the customer's pain.

## Hub Strategy Column

Explain the strategic rationale behind the Hub's approach, not a chronological list of activities.

- **Strategy over timeline.** Write "We recommended X because Y" — not "We did ADS, then RP." The reader should understand why this approach was chosen for this particular customer.
- **Show the ripple effect.** If the engagement created demand for follow-on sessions, frame it as strategy validation rather than listing future dates.
- **No dates on future sessions.** Just name them. Dates age badly and distract from the expansion narrative.
- **Surface cross-team orchestration.** When multiple Hubs, GBBs, partners, or account teams coordinated, call it out — leadership values this signal.

## Solution and Outcomes Column

Connect every customer outcome back to a stated business objective so the reader sees problem → improvement.

- **Mirror objectives to outcomes.** Each KPI should reference the original problem. Format: "[Problem area]: [metric improvement] (was: [original state])".
- **"For Microsoft" is usually fine as-is.** Revenue figures and MSX opportunities are factual — lead with the strongest number.
- **Note what's measured vs targeted.** If KPIs are customer-set targets rather than measured results, say so — don't present projections as actuals.

## Title

Keep it short and outcome-oriented. Specific details (engagement type, duration, number of teams) belong in the body columns, not the headline.

## Gotchas

- The Hub Customer Story Template (Cemille, Nov 2025) uses three equal-width light cream boxes — the right column is NOT dark.
- Column labels sit outside and above the boxes, not inside them.
- The "Customer Story" pill uses a gradient image fill, not a flat color.
- accent1 (#F4364C) in the PPTX theme is NOT used for column headers — it's a red herring.
- When editing the PPTX template directly, never add new paragraphs — text boxes have fixed sizes and overflow causes overlapping text. Replace existing text in-place only.

## Audience Reframing

For sales leadership (CVP): drop Hub jargon (ADS → "scoping session"), lead with revenue in outcomes, condense customer KPIs to emphasize the customer set their own targets (shows investment), add account expansion signals (subsidiary growth, E-level positioning, renewal timelines).

See [references/rubric.md](references/rubric.md) for the full scoring criteria — use it to identify what's needed for a 3/3 before drafting, not just to grade after.
