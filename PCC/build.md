# Microsoft Build 2026 — What Matters for PointClickCare

> Curated announcements relevant to your MCP architecture, agent platform, and enterprise data integration goals.

---

## MCP Is Now a First-Class Microsoft Pattern

### 1. Build Custom MCP Servers on Azure Functions (GA)

Microsoft published an official implementation path for exactly what you're trying to do: wrap internal services that don't have MCP implementations behind a standardized MCP server.

**The flow:**
1. Deploy an MCP server on Azure Functions (serverless, scale-to-zero, burst scaling)
2. Optionally register it in Azure API Center for organizational discoverability
3. Connect it to Foundry Agent Service — agents can now call your internal tools

**Why it matters for PCC:** This is the reference architecture for MCP-enabling your data warehouse, REST APIs, and internal systems. It supports Entra ID auth, key-based auth, and OAuth identity passthrough (OBO). It's not a science project — it's a documented, supported pattern.

> [Build and register a Model Context Protocol (MCP) server](https://learn.microsoft.com/en-us/azure/foundry/mcp/build-your-own-mcp-server)

---

### 2. Azure API Center as MCP Organizational Tool Catalog

Register your MCP servers in a private organizational catalog so teams across PCC can discover, govern, and connect to them with consistent auth and access control.

**Key capabilities:**
- Centralized registry of all internal MCP servers
- Per-server access management (users/groups)
- Auth configuration (API Key, OAuth, HTTP Bearer)
- Shows up directly in the Foundry portal "Add Tools" experience

**Why it matters for PCC:** As you scale beyond one MCP server to a repeatable pattern across teams, API Center becomes the governance layer that prevents shadow AI tooling.

> [Azure API Center overview](https://learn.microsoft.com/en-us/azure/api-center/overview)

---

### 3. Copilot Studio + MCP Integration

Copilot Studio can now connect directly to MCP servers. Published tools and resources are automatically available to agents, and changes on the MCP server are dynamically reflected — no redeploy of the agent needed.

**Why it matters for PCC:** If PCC builds MCP servers for internal data, those same servers can power both custom Foundry agents AND Copilot Studio agents without duplication. One investment, multiple consumption surfaces.

> [Extend your agent with Model Context Protocol](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agent-extend-action-mcp)

---

## Agent Platform & Operations

### 4. Foundry Agent Service (GA) + Observability

The next-generation Foundry Agent Service and Control Plane observability are generally available. You get end-to-end visibility into agent behavior, tool calls, and performance.

**Why it matters for PCC:** This moves the conversation from "prototype MCP" to "operate agents in production." Trace every tool call, monitor latency, debug failures — the operational story is now real.

> [Microsoft Foundry Agent Service](https://learn.microsoft.com/en-us/azure/foundry/agents/)

---

### 5. GPT-5.5 Available in Microsoft Foundry

OpenAI's GPT-5.5 is now available through Microsoft Foundry with enterprise security, compliance, and data residency guarantees.

**Why it matters for PCC:** Frontier model capabilities for complex reasoning over enterprise data — available on the same platform where you'd host MCP servers. No data leaves your boundary.

> [GPT-5.5 in Microsoft Foundry](https://azure.microsoft.com/en-us/blog/openais-gpt-5-5-in-microsoft-foundry-frontier-intelligence-on-an-enterprise-ready-platform/)

---

### 6. Agent 365 — Centralized Agent Governance (GA)

Agent 365 gives IT/security a single pane to observe, govern, manage, and secure agents across the organization. GA since May 1.

**Why it matters for PCC:** Addresses the core concern from your qualification call — how do you let teams build AI solutions without data exfiltration risk? Agent 365 provides the enterprise control plane for all agent activity.

> [Introducing the Frontier Suite](https://blogs.microsoft.com/blog/2026/03/09/introducing-the-first-frontier-suite-built-on-intelligence-trust/)

---

## Security & Governance

### 7. MCP on Windows — Secure Discovery & Containment

The Windows On-Device Agent Registry (ODR) provides:
- **Containment:** MCP servers run in isolated environments by default
- **Admin control:** IT can manage MCP server access via Intune
- **Logging & auditability:** All agent-to-server interactions are auditable
- **Protection:** Limits cross-prompt injection attack surface

**Why it matters for PCC:** Even on developer workstations, MCP connections are governed. This is the client-side complement to server-side controls in Foundry and API Center.

> [MCP on Windows overview](https://learn.microsoft.com/en-us/windows/ai/mcp/overview)

---

### 8. MCP Server Authentication — Multiple Patterns

Foundry supports multiple auth models for MCP server connections:
- **Key-based** (function keys) — simple, good for internal dev/test
- **Microsoft Entra ID** (agent identity or project managed identity) — production-grade, no secrets to rotate
- **OAuth identity passthrough (OBO)** — act on behalf of the signed-in user

**Why it matters for PCC:** You can start simple with key-based auth during the prototype and graduate to Entra ID managed identity for production — no architecture change needed.

> [MCP server authentication](https://learn.microsoft.com/en-us/azure/foundry/agents/how-to/mcp-authentication)

---

## Data & API Management

### 9. Azure API Management — IDC Leader (2026)

Microsoft named a Leader in the IDC MarketScape for Worldwide API Management 2026. APIM can serve as an AI Gateway with semantic caching, token limits, content safety, and load balancing for AI model calls.

**Why it matters for PCC:** If you need to govern, rate-limit, or add content safety to MCP server traffic before it hits your internal APIs, APIM sits naturally in front of your Azure Functions MCP servers.

> [IDC MarketScape: API Management 2026](https://azure.microsoft.com/en-us/blog/microsoft-named-a-leader-in-the-idc-marketscape-worldwide-api-management-2026-vendor-assessment/)

---

## The Big Picture for PCC

| Your Goal | What's Now Available |
|-----------|---------------------|
| MCP-enable internal services | Azure Functions MCP server template + `azd` deployment |
| Govern & discover MCP servers | Azure API Center organizational tool catalog |
| Secure agent-to-tool connections | Entra ID, OBO, key-based auth patterns |
| Prevent data exfiltration | Agent 365 governance + MCP containment on Windows |
| Run agents in production | Foundry Agent Service GA with observability |
| Multiple agent consumers | Same MCP server serves Foundry agents + Copilot Studio |
| Frontier model reasoning | GPT-5.5 in Foundry with enterprise guardrails |

---

**Bottom line:** Everything discussed in the qualification call — secure, repeatable MCP architecture for internal systems — now has an explicit, documented, GA implementation path from Microsoft. This is not a custom experiment; it's the platform direction.
