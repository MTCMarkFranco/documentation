# The Evolution of Generative AI — A Microsoft Perspective

From the first GitHub Copilot preview to today's multi-agent Foundry runtimes, Microsoft's generative AI stack has evolved from **single-purpose code completion** to a **full agentic platform**. This document walks through that journey and visualizes it with Mermaid.

---

## TL;DR

- **2021 – 2022:** Copilot is born. Single-model, single-task code completion.
- **2023:** Copilot goes everywhere (M365, Windows, Security, Dynamics). **GitHub Copilot Chat** turns Copilot conversational. LLM-as-product era. **Semantic Kernel** open-sourced (Mar 2023) as Microsoft's enterprise SDK for LLM orchestration.
- **2023 – 2024:** **AutoGen** introduces multi-agent orchestration as an open-source research framework.
- **2024:** **Copilot Studio** democratizes agent building for makers; **Azure AI Studio** unifies model + tooling. **Microsoft 365 Copilot Agents** + **Agent Builder** ship. **GitHub Copilot Workspace** previews task-level coding. Semantic Kernel hits **v1.0 GA**.
- **2025:** **Microsoft Foundry** launches as the enterprise agent platform. **Agents v1** = single-agent, tool-using, hosted. **GitHub Copilot Agent Mode** + **Coding Agent** make Copilot truly agentic in the IDE and on GitHub.com. **Microsoft Agent Framework** announced (Oct 2025) — merging Semantic Kernel + AutoGen into one SDK.
- **2026:** **Foundry Agents v2** = multi-agent, stateful, governed, observable. Agent Framework GA powers the runtime. GitHub Copilot + M365 Copilot agents interop with Foundry agents via A2A / MCP. Agentic apps become first-class workloads.

---

## Timeline (Mermaid)

```mermaid
timeline
    title Microsoft Generative AI Evolution (2021 → 2026)

    2021 : GitHub Copilot Technical Preview
         : Codex-powered code completion

    2022 : GitHub Copilot GA
         : ChatGPT moment — LLMs go mainstream
         : Azure OpenAI Service GA

    2023 : Semantic Kernel open-sourced (Mar)
         : Microsoft 365 Copilot announced
         : GitHub Copilot Chat — conversational coding
         : Bing Chat / Copilot in Windows
         : Security Copilot
         : AutoGen open-sourced (multi-agent research)

    2024 : Semantic Kernel v1.0 GA (.NET, Python, Java)
         : Copilot Studio GA (low-code maker platform)
         : M365 Copilot Agents + Agent Builder
         : GitHub Copilot Workspace (task-level coding preview)
         : Azure AI Studio unifies models + tooling
         : Copilot+ PCs (on-device SLMs, Phi-3)
         : AutoGen v0.4 — actor model, async runtime
         : Custom Engine Agents in M365

    2025 : Microsoft Foundry launches
         : Foundry Agents v1 — hosted, single-agent, tool-using
         : GitHub Copilot Agent Mode in VS Code
         : GitHub Copilot Coding Agent (autonomous PRs)
         : Agent Service + Agent Catalog
         : Entra Agent ID (identity for agents)
         : Magentic-One reference multi-agent system
         : Microsoft Agent Framework announced (Oct) — SK + AutoGen unified

    2026 : Microsoft Agent Framework GA
         : Foundry Agents v2 — multi-agent, stateful, governed
         : GitHub + M365 + Foundry agents interop via A2A / MCP
         : Continuous evaluation + observability built-in
         : Agentic apps as first-class Azure workloads
```

---

## Capability Progression (Mermaid)

```mermaid
graph LR
    A[GitHub Copilot<br/>2021-22<br/>Code completion] --> A2[GitHub Copilot Chat<br/>2023<br/>Conversational]
    A2 --> A3[Copilot Workspace<br/>2024<br/>Task-level coding]
    A3 --> A4[Copilot Agent Mode<br/>+ Coding Agent<br/>2025<br/>Autonomous PRs]
    A --> B[M365 + Windows Copilots<br/>2023<br/>LLM-as-product]
    B --> M[M365 Copilot Agents<br/>+ Agent Builder<br/>2024]
    B --> SK[Semantic Kernel<br/>2023-24<br/>Enterprise LLM SDK]
    B --> C[AutoGen<br/>2023-24<br/>Multi-agent research]
    B --> D[Copilot Studio<br/>2024<br/>Low-code agents]
    SK --> MAF[Microsoft Agent Framework<br/>2025-26<br/>SK + AutoGen unified]
    C --> MAF
    MAF --> E[Foundry Agents v1<br/>2025<br/>Hosted single agent + tools]
    D --> E
    M --> E
    A4 --> F
    E --> F[Foundry Agents v2<br/>2026<br/>Multi-agent · Stateful · Governed]

    classDef era1 fill:#E3F2FD,stroke:#1976D2,color:#0D47A1
    classDef era2 fill:#E8F5E9,stroke:#388E3C,color:#1B5E20
    classDef era3 fill:#FFF3E0,stroke:#F57C00,color:#E65100
    classDef era4 fill:#F3E5F5,stroke:#7B1FA2,color:#4A148C

    class A era1
    class A2,B,M,SK,C,D era2
    class A3 era2
    class A4,MAF,E era3
    class F era4
    class MAF,E era3
    class F era4
```

---

## The Four Eras

### Era 1 — Completion (2021–2022)
**GitHub Copilot.** A single model (Codex) augmenting a single task (writing code). No tools, no memory, no orchestration. The value prop: *suggest the next token*.

### Era 2 — Copilots Everywhere (2023–2024)
LLMs became **products**: Microsoft 365 Copilot, Windows Copilot, Security Copilot, Dynamics Copilot. **GitHub Copilot Chat** turned the code assistant conversational; **Copilot Workspace** (2024 preview) raised the unit of work from line → task. **M365 Copilot Agents** + **Agent Builder** let users build no-code agents grounded in their tenant. The pattern is **RAG + grounding + system prompts**. In parallel two SDKs emerged:
- **Semantic Kernel** (Mar 2023, v1.0 GA 2024) — Microsoft's **enterprise-grade** LLM orchestration SDK for .NET, Python, and Java. Plugins, planners, memory.
- **AutoGen** (late 2023) — Microsoft Research's **multi-agent conversation** framework; v0.4 (2024) introduced an actor-model async runtime.

Meanwhile **Copilot Studio** put agent-building into the hands of business makers.

### Era 3 — Agents v1 + The Great Convergence (2025)
**Microsoft Foundry** consolidated the stack: models, tools, eval, deployment, identity. **Agents v1** = a hosted runtime where one agent can call tools, retrieve knowledge, and complete bounded tasks. Identity (Entra Agent ID), governance, and the Agent Catalog made agents deployable to enterprise.

On the developer surface, **GitHub Copilot Agent Mode** turned VS Code into an agent host — plan, edit, run, test, iterate — and the **GitHub Copilot Coding Agent** went further, picking up issues on GitHub.com and opening pull requests autonomously. Copilot stopped being autocomplete and started being a teammate.

In **October 2025**, Microsoft announced the **Microsoft Agent Framework** — explicitly merging **Semantic Kernel's enterprise SDK** with **AutoGen's multi-agent runtime** into a single open-source framework. One SDK for both the research patterns and the production-ready primitives, replacing the "which one do I use?" question developers had been asking for two years.

### Era 4 — Agents v2 (2026)
**Multi-agent by default.** Agents collaborate, hand off, and persist state across the **three Copilot surfaces** (GitHub, M365, Foundry-hosted). Continuous evaluation and observability are built in, not bolted on. **Microsoft Agent Framework GA** powers the Foundry Agents v2 runtime, and **A2A + MCP** let a GitHub Copilot coding agent call an M365 Copilot agent call a Foundry agent — closing the loop between the research lineage (AutoGen → Magentic-One), the enterprise SDK lineage (Semantic Kernel), and the product lineage (Copilot → Copilot Studio → M365 Agents).

---

## Two Lineages Converging (Mermaid)

```mermaid
flowchart TB
    subgraph Research["Research lineage (multi-agent)"]
        R1[AutoGen 0.1<br/>2023]
        R2[AutoGen 0.4<br/>2024]
        R3[Magentic-One<br/>2025]
    end

    subgraph SDK["Enterprise SDK lineage"]
        S1[Semantic Kernel<br/>Mar 2023]
        S2[Semantic Kernel 1.0<br/>2024]
    end

    subgraph Product["Product lineage"]
        P1[GitHub Copilot<br/>2021]
        P2[M365 Copilot<br/>2023]
        P3[Copilot Studio<br/>2024]
    end

    subgraph Framework["SDK convergence"]
        MAF1[Microsoft Agent Framework<br/>announced Oct 2025]
        MAF2[Agent Framework GA<br/>2026]
    end

    subgraph Platform["Platform convergence"]
        F1[Foundry Agents v1<br/>2025]
        F2[Foundry Agents v2<br/>2026]
    end

    R1 --> R2 --> R3 --> MAF1
    S1 --> S2 --> MAF1
    MAF1 --> MAF2
    P1 --> P2 --> P3 --> F1
    MAF2 --> F2
    F1 --> F2
```

---

## What Changed at Each Step

| Era | Unit of Work | Orchestration | State | Governance |
|-----|--------------|---------------|-------|------------|
| Copilot (2021–22) | Token suggestion | None | Stateless | App-level |
| Copilots (2023–24) | Grounded response | Single-shot RAG | Session | Tenant policies |
| GitHub Copilot Chat (2023) | Multi-turn coding answer | Inline + chat | Workspace context | Repo / org policies |
| M365 Copilot Agents (2024) | Tenant-grounded task | Declarative + actions | Conversation | Purview + admin |
| Copilot Workspace (2024) | Issue → plan → PR | Plan-edit-test loop | Workspace | Repo policies |
| Semantic Kernel (2023–24) | Function / plugin call | Planner + plugins | Memory store | Developer-owned |
| AutoGen (2023–24) | Agent turn | Conversational, code | In-memory | Developer-owned |
| Copilot Studio (2024) | Topic / action | Declarative flows | Conversation | Maker + admin |
| Foundry Agents v1 (2025) | Tool-using task | Single agent loop | Threads | Entra Agent ID, RBAC |
| GH Copilot Agent Mode (2025) | Autonomous coding session | Plan + tool calls in IDE | Workspace + git | Repo policies + review |
| GH Copilot Coding Agent (2025) | Issue → autonomous PR | Background runner on GitHub.com | Branch state | Branch protection + review |
| Agent Framework (2025–26) | Agent + workflow | SK plugins **+** AutoGen graphs | Durable threads | Enterprise-grade |
| Foundry Agents v2 (2026) | Multi-agent workflow | A2A / MCP / handoff | Durable + shared | Continuous eval + audit |

---

*Render the Mermaid blocks in any Mermaid-capable viewer (VS Code preview, GitHub, Loop, MkDocs, etc.).*
