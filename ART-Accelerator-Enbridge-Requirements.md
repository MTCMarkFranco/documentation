# ART Voice Agent Accelerator — Enbridge Rapid Prototype Requirements Document

**Prepared for:** Enbridge "Home Move" Call Centre Voice Agent Rapid Prototype  
**Prototype Dates:** May 5–6, 2026  
**Accelerator Repository:** [Azure-Samples/art-voice-agent-accelerator](https://github.com/Azure-Samples/art-voice-agent-accelerator)  
**Document Version:** 1.0 — April 22, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Complete Azure Resource Requirements](#3-complete-azure-resource-requirements)
4. [Infrastructure Specification for Pre-Provisioning](#4-infrastructure-specification-for-pre-provisioning)
5. [Voice Modality Recommendation: SpeechCascade vs VoiceLive](#5-voice-modality-recommendation-speechcascade-vs-voicelive)
6. [Knowledge Base & RAG Prerequisites](#6-knowledge-base--rag-prerequisites)
7. [SAP Integration Requirements](#7-sap-integration-requirements)
8. [Network & Connectivity Requirements](#8-network--connectivity-requirements)
9. [RBAC & Identity Requirements](#9-rbac--identity-requirements)
10. [Technical Prerequisites Checklist](#10-technical-prerequisites-checklist)
11. [Workshop Roles & Responsibilities](#11-workshop-roles--responsibilities)
12. [Required Skillsets](#12-required-skillsets)
13. [Pre-Workshop Action Items & Timeline](#13-pre-workshop-action-items--timeline)
14. [Answers to All Outstanding Questions](#14-answers-to-all-outstanding-questions)

---

## 1. Executive Summary

The ART (Azure Real-Time) Voice Agent Accelerator is a code-first, modular framework for building real-time voice agents on Azure. It provides the end-to-end voice plumbing — telephony (ACS), app middleware, AI inference loop (STT → LLM → TTS), and orchestration — so the team can focus on Enbridge-specific tools, agent design, and orchestration logic for the "Home Move" use case.

**Key decisions confirmed for Enbridge:**
- **Database:** Cosmos DB NoSQL (requires adaptation from the accelerator's default MongoDB API — see Section 3)
- **Voice Modality:** ACS (Azure Communication Services) — not Genesys
- **SAP Data:** Available via custom gateway, consumed as an agent tool
- **Knowledge Base:** PDF call centre scripts for "Home Move" process guidance

**Deployment time via `azd up`:** ~25 minutes (15–20 min infra + 5–10 min container build/push)

---

## 2. Architecture Overview

The ART accelerator deploys a multi-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      VOICE CHANNEL                          │
│  ACS (PSTN/SIP) ─── Media Streaming ─── Event Grid         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   COMPUTE LAYER                              │
│  Azure Container Apps (Backend: FastAPI + WebSockets)        │
│  Azure Container Apps (Frontend: Vite + React)               │
│  Azure Container Registry (ACR)                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  AI INFERENCE LAYER                           │
│  Azure OpenAI (GPT-4o, GPT-4o-mini) ── Azure AI Foundry     │
│  Azure Speech Services (STT + TTS)                           │
│  [Optional] Azure VoiceLive (gpt-4o-realtime)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    DATA LAYER                                │
│  Cosmos DB (conversation history & agent state)              │
│  Azure Cache for Redis Enterprise (session state/caching)    │
│  Azure Storage Account (audio recordings, prompts, media)    │
│  Azure Key Vault (secrets, connection strings, API keys)     │
│  Azure App Configuration (centralized config management)     │
└─────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  MONITORING LAYER                             │
│  Application Insights (APM, distributed tracing)             │
│  Log Analytics Workspace (centralized logs)                  │
│  Event Grid System Topic (ACS incoming call events)          │
└─────────────────────────────────────────────────────────────┘
```

**Two voice orchestration modes are available:**

| Mode | Path | Latency | Best For |
|------|------|---------|----------|
| **SpeechCascade** (default) | Azure Speech STT → LLM → TTS | ~400ms | Custom VAD, phrase lists, domain-specific tuning, full control |
| **VoiceLive** | Azure VoiceLive SDK (gpt-4o-realtime) | ~200ms | Fastest setup, lowest latency, managed voice-to-voice |

---

## 3. Complete Azure Resource Requirements

> **CRITICAL NOTE — Cosmos DB NoSQL vs MongoDB API:**  
> The ART accelerator is built with **Cosmos DB MongoDB API** (vCore cluster) by default. Enbridge has chosen **Cosmos DB NoSQL**. This requires code-level changes in the data access layer (`src/` libraries for Cosmos) and Terraform modifications. The team should plan ~2–4 hours during Day 1 to adapt the Cosmos integration layer from `pymongo` to `azure-cosmos` SDK, or alternatively, use the accelerator's default MongoDB API for the rapid prototype and migrate to NoSQL post-prototype.  
> **Recommendation for the Rapid Prototype:** Use Cosmos DB MongoDB API during the 2-day prototype to avoid unnecessary friction, then plan a post-prototype migration to NoSQL if required.

### 3.1 Complete Resource List (17 Azure Resources)

| # | Azure Resource | Purpose | SKU / Tier | Estimated Monthly Cost (PoC) |
|---|---------------|---------|------------|------------------------------|
| 1 | **Resource Group** | Logical container for all resources | N/A | Free |
| 2 | **Azure OpenAI (via AI Foundry)** | GPT-4o model for conversational AI | S0 tier | Usage-based (~$5-15/1M tokens) |
| 3 | **Azure AI Speech Services** | Speech-to-Text (STT) and Text-to-Speech (TTS) | S0 tier | ~$1/hr audio (STT), ~$16/1M chars (TTS) |
| 4 | **Azure Communication Services (ACS)** | Call Automation, Media Streaming, PSTN telephony | Pay-as-you-go / Basic | ~$0.008/min PSTN |
| 5 | **Azure Email Communication Service** | Email domain management (optional, managed domain) | Included w/ ACS | Minimal |
| 6 | **Cosmos DB** | Conversation history, agent state persistence | **MongoDB vCore M30** (default) — see note on NoSQL | ~$270/mo (M30). Can use M25 for PoC |
| 7 | **Azure Cache for Redis (Enterprise)** | Session state, low-latency caching | **MemoryOptimized_M10** | ~$230/mo |
| 8 | **Azure Storage Account** | Audio recordings, prompts, media blobs | Standard LRS, StorageV2 | ~$2-5/mo |
| 9 | **Azure Key Vault** | Secure storage for secrets, connection strings, API keys | Standard | ~$0.03/10K operations |
| 10 | **Azure App Configuration** | Centralized configuration management | Standard | ~$1.20/day |
| 11 | **Azure Container Apps (Backend)** | FastAPI + WebSockets voice pipeline | **2 vCPU / 4 GiB** (configurable) | ~$60-150/mo |
| 12 | **Azure Container Apps (Frontend)** | Vite + React demo client | **0.5 vCPU / 1 GiB** | ~$15-30/mo |
| 13 | **Container Apps Environment** | Shared environment with logging integration | Consumption | Included |
| 14 | **Azure Container Registry (ACR)** | Private Docker image repository | Basic | ~$5/mo |
| 15 | **Application Insights** | Distributed tracing, telemetry, performance monitoring | Per-GB | ~$2.30/GB |
| 16 | **Log Analytics Workspace** | Centralized log aggregation and query engine | Per-GB (30-day retention) | ~$2.76/GB |
| 17 | **Event Grid System Topic** | Event subscription for ACS incoming call notifications | Per operation | ~$0.60/1M operations |
| 18 | **User-Assigned Managed Identity (Backend)** | Identity for backend to access Azure resources | Free | Free |
| 19 | **User-Assigned Managed Identity (Frontend)** | Identity for frontend to access Azure resources | Free | Free |

**Optional (if VoiceLive mode chosen):**

| # | Azure Resource | Purpose | SKU / Tier |
|---|---------------|---------|------------|
| 20 | **Azure VoiceLive (AI Foundry)** | Real-time voice-to-voice with gpt-4o-realtime | Preview (region-limited) |
| 21 | **Separate AI Foundry Account for VoiceLive** | Required if primary region doesn't support VoiceLive | S0 |

**Optional (for RAG / Knowledge Base):**

| # | Azure Resource | Purpose | SKU / Tier |
|---|---------------|---------|------------|
| 22 | **Azure AI Search** | Vector search for knowledge base documents | Basic or Standard S1 |
| 23 | **Azure OpenAI Embeddings** | text-embedding-3-large deployment for vectorization | Part of AOAI resource |

---

## 4. Infrastructure Specification for Pre-Provisioning

### 4.1 Minimum Resource Specifications

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ENBRIDGE PoC SPECIFICATIONS                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REGION: Canada East (preferred) or East US 2                        │
│  Note: Verify Azure OpenAI GPT-4o model availability in Canada East  │
│  Note: VoiceLive only available in: eastus2, westus2,                │
│        swedencentral, southeastasia                                  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  COMPUTE                                                             │
│  ├─ Backend Container App:  2 vCPU / 4 GiB memory                   │
│  │  ├─ Min replicas: 5 (default) — reduce to 1–2 for PoC           │
│  │  ├─ Max replicas: 50 (default) — reduce to 5–10 for PoC         │
│  │  └─ Sticky sessions: enabled                                     │
│  ├─ Frontend Container App: 0.5 vCPU / 1 GiB memory                 │
│  │  └─ Min replicas: 1, Max replicas: 10                            │
│  └─ Container Registry: Basic SKU                                    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  AI & VOICE                                                          │
│  ├─ Azure OpenAI (AI Foundry):                                       │
│  │  ├─ gpt-4o:                DataZoneStandard, 150K TPM capacity   │
│  │  ├─ gpt-4o-mini:           DataZoneStandard, 150K TPM capacity   │
│  │  ├─ text-embedding-3-large: GlobalStandard, 100K TPM capacity    │
│  │  └─ [Optional] o3-mini:    DataZoneStandard, 50K TPM capacity    │
│  ├─ Azure Speech Services: S0 tier                                   │
│  │  └─ Custom domain endpoint (required for ACS integration)         │
│  └─ Azure Communication Services: Pay-as-you-go                      │
│     ├─ Data Location: Canada (or United States)                      │
│     ├─ Phone number provisioning (post-deployment manual step)       │
│     └─ Cognitive Services linked identity for real-time              │
│        transcription                                                 │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  DATA                                                                │
│  ├─ Cosmos DB MongoDB vCore:                                         │
│  │  ├─ SKU: M30 (default) — M25 acceptable for PoC                  │
│  │  ├─ Storage: 128 GB PremiumSSD                                    │
│  │  ├─ Shard count: 1                                                │
│  │  ├─ Server version: 8.0                                           │
│  │  └─ Public network access: Enabled (PoC)                          │
│  ├─ Azure Cache for Redis Enterprise:                                │
│  │  ├─ SKU: MemoryOptimized_M10 (minimum for Enterprise)            │
│  │  ├─ Port: 10000                                                   │
│  │  ├─ Clustering: OSSCluster                                        │
│  │  ├─ TLS: 1.2 minimum                                             │
│  │  └─ Authentication: RBAC (local auth disabled)                    │
│  ├─ Storage Account: Standard LRS, StorageV2                         │
│  │  ├─ Container: "audioagent" (private)                             │
│  │  └─ Container: "prompt" (private)                                 │
│  ├─ Key Vault: Standard, RBAC-enabled                                │
│  └─ App Configuration: Standard                                      │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  MONITORING                                                          │
│  ├─ Application Insights: Web type, per-GB billing                   │
│  ├─ Log Analytics Workspace: PerGB2018, 30-day retention             │
│  └─ Event Grid System Topic: for ACS incoming call events            │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  IDENTITY                                                            │
│  ├─ User-Assigned Managed Identity: Backend                          │
│  └─ User-Assigned Managed Identity: Frontend                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Cosmos DB Specific Guidance

**If staying with the accelerator default (MongoDB API — RECOMMENDED for PoC):**
- SKU: M30 (or M25 to save cost)
- Autoscale up to 1000 RU/s equivalent throughput
- Database name: `audioagentdb`
- Collection name: `audioagentcollection`

**If using Cosmos DB NoSQL (Enbridge's stated preference):**
- Requires code modification in:
  - `src/` Cosmos integration libraries (swap `pymongo` → `azure-cosmos` SDK)
  - Terraform `data.tf` (replace MongoDB vCore cluster with NoSQL account)
  - Connection string format changes in Key Vault secrets
- Minimum throughput: **1000 RU/s** (autoscale recommended)
- Partition key strategy: `/sessionId` or `/conversationId` (to be determined during workshop)
- Recommended containers: `conversations`, `agentState`

### 4.3 ACS-Specific Configuration

Since ACS is the chosen voice-first modality (not Genesys):
- **Phone Number:** Must be provisioned manually via Azure Portal after ACS resource creation
  - Toll-free or local number in E.164 format (e.g., `+1XXXXXXXXXX`)
  - Canadian phone numbers available
- **Features Required:**
  - Call Automation API
  - Bidirectional Media Streaming
  - Event Grid integration (incoming call webhooks)
  - Cognitive Services linkage (for real-time STT/TTS)
  - Call Recording (optional, can be enabled via feature flag)
- **Data Location:** "Canada" or "United States"

### 4.4 Region Considerations

| Service | Canada East Availability | Alternative Region |
|---------|------------------------|-------------------|
| Azure OpenAI (GPT-4o) | Check availability — DataZoneStandard may route cross-region | East US 2 |
| Azure Speech Services | Available | East US 2 |
| Azure Communication Services | Global (data residency: Canada) | United States |
| Azure VoiceLive (if needed) | **NOT available** | **eastus2, westus2, swedencentral, southeastasia** |
| Redis Enterprise | Available | East US 2 |
| Cosmos DB vCore | Available | East US 2 |
| Container Apps | Available | East US 2 |
| AI Foundry | Available | East US 2 |

> **Recommendation:** Deploy primary infrastructure in **Canada East**. If VoiceLive mode is desired, a secondary AI Foundry account will be auto-provisioned in `eastus2` by the Terraform config.  
> If GPT-4o DataZoneStandard is not available in Canada East, set `openai_location = "eastus2"` in the Terraform variables.

---

## 5. Voice Modality Recommendation: SpeechCascade vs VoiceLive

### Decision Matrix for Enbridge

| Criterion | SpeechCascade | VoiceLive |
|-----------|--------------|-----------|
| **Latency** | ~400ms | ~200ms |
| **Setup complexity** | Medium — More config, more control | Low — Fastest path to demo |
| **Custom VAD (Voice Activity Detection)** | Yes — full control over silence detection, barge-in | No — server-side VAD only |
| **Domain-specific phrase lists** | Yes — boost SAP/Enbridge terminology recognition | No |
| **Azure Neural TTS voices** | Full catalog, styles, prosody control | HD voices only (e.g., `en-US-Ava:DragonHDLatestNeural`) |
| **Region availability** | All regions w/ Speech Services | **eastus2, westus2, swedencentral, southeastasia only** |
| **Canada East deployment** | **Yes** | **No — requires secondary region** |
| **Maturity** | GA | Preview |
| **Production path** | Clearer | Emerging |

### Recommendation for Enbridge Rapid Prototype

**SpeechCascade is recommended** for the following reasons:
1. Enbridge prefers Canada East deployment — VoiceLive is not available in Canada
2. Call centre use cases benefit from custom phrase lists (SAP terminology, Enbridge-specific terms)
3. More control over the inference pipeline for compliance/regulatory requirements
4. SpeechCascade is the default mode and more battle-tested
5. Custom VAD allows tuning for call centre audio environments (background noise, hold music)

Set the environment variable:
```bash
export ACS_STREAMING_MODE=MEDIA  # SpeechCascade (default)
```

---

## 6. Knowledge Base & RAG Prerequisites

### 6.1 Pre-Workshop Preparation for Call Centre Scripts

Enbridge has PDF files containing call centre scripts for the "Home Move" use case. These should be indexed and vectorized **before** the workshop to maximize productive time.

**Option A: Azure AI Search + Embeddings (Recommended)**

Pre-provision and prepare:
1. **Azure AI Search** — Basic or Standard S1 tier
2. **Azure OpenAI Embeddings** — `text-embedding-3-large` deployment (already included in default model deployments)
3. **Index the PDFs:**
   - Extract text from PDFs (use Azure Document Intelligence or Python libraries)
   - Chunk into semantic segments (recommended: ~512 tokens per chunk with overlap)
   - Generate embeddings using `text-embedding-3-large`
   - Upload to Azure AI Search vector index
4. **Index name:** e.g., `enbridge-home-move-kb`

**Option B: Azure AI Foundry Knowledge Base**

1. Create an Azure AI Foundry project (auto-provisioned by ART)
2. Upload PDFs to Foundry KB
3. Foundry handles chunking, embedding, and indexing
4. Reference the KB from agent configuration

**Pre-Workshop Action:**
- Collect all "Home Move" PDF call scripts
- Determine which option (A or B) to use
- If Option A: index documents and have search endpoint + index name ready
- If Option B: upload documents to Foundry project and verify KB is queryable

### 6.2 Environment Variables for RAG

```bash
# Azure AI Search (Option A)
AZURE_AI_SEARCH_SERVICE_ENDPOINT=https://your-search.search.windows.net
AZURE_SEARCH_INDEX_NAME=enbridge-home-move-kb
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-large
```

---

## 7. SAP Integration Requirements

### 7.1 Architecture

Enbridge is exposing SAP data through a **custom gateway**. This will be consumed as an **agent tool** within the ART framework.

```
ART Agent ──(HTTP/REST)──> Enbridge Custom SAP Gateway ──> SAP System
```

### 7.2 Prerequisites

| Requirement | Details | Owner |
|------------|---------|-------|
| SAP Gateway endpoint URL | HTTPS endpoint accessible from Azure Container Apps | Enbridge SAP Team |
| Authentication method | API key, OAuth2, or certificate-based | Enbridge SAP Team |
| API documentation / Swagger spec | Request/response schemas for Home Move operations | Enbridge SAP Team |
| Network connectivity | Container Apps → SAP Gateway (firewall rules, VPN, ExpressRoute, or public) | Enbridge Network Team + Kevin |
| Test data / sandbox | Non-production SAP data for the prototype | Enbridge SAP Team |
| Rate limits / throttling info | Understand gateway capacity for concurrent calls | Enbridge SAP Team |

### 7.3 ART Tool Integration

The SAP integration will be built as a custom tool in `apps/artagent/backend/registries/toolstore/`. This involves:
1. Creating a Python tool class that calls the SAP gateway REST API
2. Registering the tool in the agent's YAML configuration
3. Defining the tool schema (input parameters, output format) so the LLM can invoke it

**This is the primary Day 1 workshop activity.**

---

## 8. Network & Connectivity Requirements

### 8.1 For the Prototype (Public Endpoints)

The ART accelerator's Terraform defaults to **public endpoints** for PoC purposes. This means:
- All Azure resources are publicly accessible (with authentication)
- ACS → Speech Services connectivity works via public internet
- Container Apps expose public HTTPS ingress

### 8.2 Critical Connectivity Paths

| Source | Destination | Protocol | Port | Purpose |
|--------|------------|----------|------|---------|
| Azure Container Apps (Backend) | SAP Custom Gateway | HTTPS | 443 | SAP data retrieval |
| Azure Container Apps (Backend) | Azure OpenAI | HTTPS | 443 | LLM inference |
| Azure Container Apps (Backend) | Azure Speech Services | HTTPS / WSS | 443 | STT & TTS |
| Azure Container Apps (Backend) | Cosmos DB | HTTPS | 443 (10255 for MongoDB) | Data persistence |
| Azure Container Apps (Backend) | Redis Enterprise | TLS | 10000 | Session caching |
| ACS | Container Apps (Backend) | HTTPS (webhook) | 443 | Incoming call events |
| ACS | Speech Services | HTTPS | 443 | Cognitive services linkage |
| PSTN Caller | ACS | PSTN / SIP | N/A | Inbound phone calls |
| Developer Machine | Azure | HTTPS | 443 | `azd up`, Portal, debugging |

### 8.3 Firewall Rules Needed

If Enbridge's SAP gateway is behind a corporate firewall:
- Whitelist Azure Container Apps **outbound IPs** (or use VNet integration with known egress IPs)
- Alternatively, use Azure API Management or Private Endpoints for SAP gateway connectivity

**Action item for Kevin + Eric + Adam Cooke:** Ensure network path from Azure Container Apps → SAP Custom Gateway is open and tested before May 5.

---

## 9. RBAC & Identity Requirements

### 9.1 Deployer Requirements

The person running `azd up` needs:

| Role | Scope | Purpose |
|------|-------|---------|
| **Contributor** | Subscription or Resource Group | Create all Azure resources |
| **User Access Administrator** | Subscription or Resource Group | Assign RBAC roles to managed identities |
| **Cognitive Services Contributor** | Subscription | Deploy OpenAI models |

### 9.2 Service-to-Service RBAC (Auto-Provisioned by Terraform)

These are automatically assigned during `azd up`:

| Service | Role | Target | Purpose |
|---------|------|--------|---------|
| Backend Managed Identity | Cognitive Services OpenAI User | AI Foundry Account | GPT-4o model access |
| Backend Managed Identity | Cognitive Services User | Speech Services | STT/TTS operations |
| Backend Managed Identity | Storage Blob Data Contributor | Storage Account | Read/write audio files |
| Backend Managed Identity | Key Vault Secrets User | Key Vault | Runtime secret retrieval |
| Backend Managed Identity | AcrPull | Container Registry | Pull container images |
| Backend Managed Identity | Monitoring Metrics Publisher | Application Insights | Telemetry publishing |
| Frontend Managed Identity | Cognitive Services OpenAI User | AI Foundry Account | Model access |
| Frontend Managed Identity | AcrPull | Container Registry | Pull container images |
| ACS System Identity | Cognitive Services User | Speech Services | Real-time transcription |
| ACS System Identity | Storage Blob Data Contributor | Storage Account | Call recording storage |
| Deployer Principal | Key Vault Administrator | Key Vault | Secret management |
| Deployer Principal | AcrPush + AcrPull | Container Registry | Build & push images |
| Deployer Principal | Storage Blob Data Contributor/Reader | Storage Account | Upload prompts |

### 9.3 Entra ID Requirements

- Azure AD tenant with ability to create:
  - User-Assigned Managed Identities (2)
  - App Registrations (if auth validation enabled)
- Service Principal or user account for deployment with roles listed above

---

## 10. Technical Prerequisites Checklist

### 10.1 Before May 5 — Infrastructure (Enbridge AI COE Team)

- [ ] **Azure Subscription** — Active with sufficient quota for all resources
- [ ] **Deployer Account** — With Contributor + User Access Administrator roles
- [ ] **Quota Verification:**
  - [ ] Azure OpenAI: GPT-4o, GPT-4o-mini, text-embedding-3-large model access approved
  - [ ] Azure OpenAI: Sufficient TPM (tokens per minute) quota — 150K TPM recommended
  - [ ] Container Apps: vCPU quota in target region (minimum 5 vCPU)
  - [ ] Redis Enterprise: MemoryOptimized_M10 available in target region
  - [ ] Cosmos DB vCore: M30 (or M25) available in target region
- [ ] **Resource Provider Registration** — Ensure these providers are registered:
  - `Microsoft.CognitiveServices`
  - `Microsoft.Communication`
  - `Microsoft.App`
  - `Microsoft.Cache`
  - `Microsoft.DocumentDB`
  - `Microsoft.KeyVault`
  - `Microsoft.Storage`
  - `Microsoft.EventGrid`
  - `Microsoft.OperationalInsights`
  - `Microsoft.Insights`
  - `Microsoft.ContainerRegistry`
  - `Microsoft.AppConfiguration`
- [ ] **Region Decision** — Confirm Canada East (or alternative)
- [ ] **ACS Phone Number** — Provisioned (or budget approved for provisioning post-deployment)

### 10.2 Before May 5 — Development Environment (Hands-on-Keyboard Team)

- [ ] **Azure CLI** installed — `az --version` (>= 2.50.0)
- [ ] **Azure Developer CLI (azd)** installed — `azd version`
- [ ] **Docker Desktop** (or Podman) installed — `docker --version`
- [ ] **Git** installed
- [ ] **Python 3.11+** installed (for local development/debugging)
- [ ] **Node.js** (for frontend development, if needed)
- [ ] **Clone the repo:**
  ```bash
  git clone https://github.com/Azure-Samples/art-voice-agent-accelerator.git
  cd art-voice-agent-accelerator
  ```
- [ ] **Test Azure login:**
  ```bash
  az login
  azd auth login
  ```

### 10.3 Before May 5 — Data & Content (Business/Data Teams)

- [ ] **Call centre PDF scripts** — All "Home Move" process documents collected
- [ ] **Knowledge base indexed** (if using Option A, Azure AI Search)
- [ ] **SAP Gateway documentation** — API specs, authentication details, test credentials
- [ ] **SAP test environment** — Non-production data accessible via the custom gateway
- [ ] **Sample call scenarios** — 5-10 representative "Home Move" caller scenarios for testing
- [ ] **Business rules** — Escalation rules, transfer logic, compliance requirements documented

### 10.4 Before May 5 — Network (Kevin + Eric + Adam Cooke)

- [ ] **SAP Gateway → Azure connectivity** tested and verified
- [ ] **Firewall rules** in place for Azure Container Apps → SAP Gateway
- [ ] **DNS resolution** confirmed between Azure and SAP endpoint
- [ ] **VPN / ExpressRoute** (if required) configured and tested

---

## 11. Workshop Roles & Responsibilities

### 11.1 Required Roles

| # | Role | Who (Enbridge) | Responsibilities | Required Days | Critical? |
|---|------|----------------|------------------|---------------|-----------|
| 1 | **AI COE Engineers** (Hands-on-Keyboard) | AI COE Team (2-3 people) | Deploy infrastructure, configure agents, write tool integrations, build/test the agent pipeline | Day 1 + Day 2 | **CRITICAL** |
| 2 | **Call Centre Technology Lead** | Eric, Arjun | Define call flows, IVR requirements, ACS phone number setup, transfer logic, call recording requirements | Day 1 + Day 2 | **CRITICAL** |
| 3 | **SAP Integration Engineer** | SAP Team representative | Provide API documentation, test credentials, troubleshoot gateway connectivity, validate data schemas | Day 1 (mandatory), Day 2 (on-call) | **CRITICAL** |
| 4 | **Business Process SME** | Business stakeholder with "Home Move" process knowledge | Define conversation flows, validate agent responses, provide acceptance criteria, review call scripts | Day 1 + Day 2 | **CRITICAL** |
| 5 | **Data & Analytics Representative** | Data & Analytics Team | Advise on data access patterns, Cosmos DB design, reporting requirements, telemetry needs | Day 1 (advisory), Day 2 (optional) | **IMPORTANT** |
| 6 | **Network / Infrastructure Admin** | IT / Network Team | Troubleshoot connectivity issues, firewall changes, DNS, VPN/ExpressRoute if needed | On-call Day 1 + Day 2 | **IMPORTANT** |
| 7 | **Executive Sponsor / Delivery Lead** | Michael (Sponsor), Eric (Delivery Lead) | Decision-making authority, scope control, priority calls | Day 1 kickoff + Day 2 demo | **IMPORTANT** |

### 11.2 Microsoft / Delivery Team Roles

| # | Role | Who | Responsibilities |
|---|------|-----|------------------|
| 1 | **ART Accelerator Technical Lead** | Kevin / Sergey | Lead deployment, architect agent design, troubleshoot ART framework |
| 2 | **Voice AI Specialist** | Sergey | Configure SpeechCascade, tune VAD/STT/TTS, optimize latency |
| 3 | **Solution Architect** | Mark | Overall architecture, integration patterns, Cosmos DB guidance |
| 4 | **Project Coordinator** | Delivery lead | Agenda management, stakeholder alignment, issue escalation |

### 11.3 Workshop Agenda (Suggested)

**Day 1 — May 5 (Build)**

| Time | Activity | Roles Needed |
|------|----------|-------------|
| 9:00–9:30 | Kickoff, architecture walkthrough, confirm scope | All |
| 9:30–11:00 | Run `azd up`, validate infrastructure, ACS phone number setup | AI COE, Kevin/Sergey |
| 11:00–12:00 | SAP Gateway connectivity testing, API validation | AI COE, SAP Team, Network Admin |
| 12:00–1:00 | Lunch | — |
| 1:00–3:00 | Build SAP tool integration, configure agent YAML, prompt engineering | AI COE, Kevin/Sergey, Business SME |
| 3:00–4:30 | Integrate knowledge base (PDF scripts), test RAG retrieval | AI COE, Sergey, Business SME |
| 4:30–5:00 | Day 1 wrap-up, identify blockers, plan Day 2 | All |

**Day 2 — May 6 (Test & Demonstrate)**

| Time | Activity | Roles Needed |
|------|----------|-------------|
| 9:00–9:30 | Day 2 kickoff, resolve overnight blockers | AI COE, Kevin/Sergey |
| 9:30–11:30 | End-to-end call testing (PSTN → ACS → Agent → SAP → Response) | AI COE, Call Centre Team, Business SME |
| 11:30–12:30 | Prompt tuning, conversation flow refinement | AI COE, Sergey, Business SME |
| 12:30–1:30 | Lunch | — |
| 1:30–3:00 | Scenario testing (edge cases, transfers, escalations) | AI COE, Call Centre Team, Business SME |
| 3:00–4:00 | Stakeholder demo | All + Executive Sponsor |
| 4:00–5:00 | Retrospective, next steps, production roadmap | All |

---

## 12. Required Skillsets

### 12.1 Enbridge Team Skillsets

| Skillset | Proficiency Level | Who Should Have It | Purpose |
|----------|------------------|-------------------|---------|
| **Python 3.11+** | Intermediate–Advanced | AI COE Engineers | Tool integration, debugging, agent customization |
| **Azure Portal / Azure CLI** | Intermediate | AI COE Engineers | Resource management, troubleshooting |
| **REST APIs / HTTP** | Intermediate | AI COE Engineers | SAP Gateway integration, debugging |
| **Docker / Containers** | Basic–Intermediate | AI COE Engineers | Container builds, local testing |
| **YAML Configuration** | Basic | AI COE Engineers | Agent and scenario configuration |
| **Jinja2 Templates** | Basic | AI COE Engineers | Prompt template customization |
| **Azure Communication Services** | Basic | Call Centre Tech Team | Phone number management, call flow understanding |
| **Telephony / IVR concepts** | Intermediate | Call Centre Tech Team | Call routing, DTMF, transfer logic |
| **SAP APIs** | Intermediate | SAP Team | Gateway API documentation, troubleshooting |
| **Business process knowledge** | Expert | Business SME | "Home Move" process, call scripts, edge cases |

### 12.2 Tools & Technologies Used by the Accelerator

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Backend application language |
| FastAPI | >=0.104.0 | Web framework for backend API + WebSockets |
| React (Vite) | Latest | Frontend demo client |
| Terraform | >=1.1.7, <2.0 | Infrastructure as Code |
| Azure Developer CLI (azd) | Latest | Deployment orchestration |
| Docker | Latest | Container builds |
| WebSockets | — | Bidirectional audio streaming |
| YAML + Jinja2 | — | Agent configuration + prompt templates |
| OpenTelemetry | 1.37.0 | Distributed tracing and telemetry |

---

## 13. Pre-Workshop Action Items & Timeline

### Week of April 22–25 (This Week)

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 1 | Share this requirements document with Enbridge | Mark/Kevin | April 23 |
| 2 | Confirm region (Canada East vs East US 2) | Enbridge + Microsoft | April 24 |
| 3 | Verify Azure OpenAI model quota in target region | Enbridge AI COE | April 25 |
| 4 | Register required Azure resource providers | Enbridge AI COE | April 25 |
| 5 | Confirm deployer account RBAC roles | Enbridge AI COE | April 25 |

### Week of April 28–May 2

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 6 | Clone repo, install prerequisites (CLI tools, Docker) | Enbridge AI COE | April 28 |
| 7 | Test `az login` and `azd auth login` | Enbridge AI COE | April 28 |
| 8 | **Run `azd up` to deploy infrastructure** (or `azd provision` for infra only) | Enbridge AI COE + Kevin | April 29 |
| 9 | Provision ACS phone number via Azure Portal | Enbridge AI COE | April 30 |
| 10 | Collect and share all "Home Move" PDF scripts | Business SME | April 28 |
| 11 | Index PDFs into Azure AI Search (or Foundry KB) | Enbridge AI COE / Sergey | April 30 |
| 12 | Provide SAP Gateway API documentation + test credentials | SAP Team | April 28 |
| 13 | Test network connectivity: Azure → SAP Gateway | Kevin + Adam Cooke + Network | April 30 |
| 14 | Prepare 5-10 "Home Move" test scenarios | Business SME + Call Centre Team | May 1 |
| 15 | Confirm workshop attendees and travel | Eric / Delivery Lead | April 28 |
| 16 | **Smoke test:** Make a test call through ACS to validate end-to-end | Enbridge AI COE + Kevin | May 2 |

### Day Before (May 4)

| # | Action | Owner |
|---|--------|-------|
| 17 | Final connectivity check: all Azure resources healthy | Enbridge AI COE |
| 18 | Verify SAP Gateway still accessible from Azure | SAP Team + AI COE |
| 19 | Ensure all attendees have Azure Portal access | AI COE |

---

## 14. Answers to All Outstanding Questions

### Q1: "Have we/can we provide a complete list of the resources required by the ART accelerator to Enbridge?"

**Yes — see Section 3.** The ART accelerator provisions 17–19 core Azure resources automatically via `azd up` (Terraform). The complete list with SKUs, tiers, and specifications is in Section 3.1 and Section 4.1.

### Q2: "Kevin, can you please work with Eric + Adam Cooke to ensure that these resources are provisioned and that the team submits whatever request is required to ensure they've got network connectivity between those resources and the SAP environment?"

**Action items identified in Sections 8 and 13.** The critical path is:
1. Run `azd up` to provision all Azure resources (April 29)
2. After deployment, the Azure Container Apps backend will have a public FQDN — test connectivity from that endpoint to the SAP Custom Gateway
3. If SAP Gateway is behind a corporate firewall, whitelist the Container Apps outbound IPs
4. Test with a simple HTTP call from the backend container to the SAP endpoint

### Q3: "Do they need to clone the ART repo and azd up?"

**Yes.** The deployment process is:
```bash
git clone https://github.com/Azure-Samples/art-voice-agent-accelerator.git
cd art-voice-agent-accelerator
azd auth login
azd up  # ~25 minutes
```
This provisions all infrastructure via Terraform and builds/pushes both frontend and backend containers. **This should be done before May 5** (target: April 29) so Day 1 can focus on customization, not deployment.

### Q4: "What other technical pre-reqs are required?"

**See Section 10 for the complete checklist.** Beyond `azd up`:
- Azure CLI >= 2.50.0
- Azure Developer CLI (azd)
- Docker Desktop
- Python 3.11+ (for local development)
- Contributor + User Access Administrator roles on the Azure subscription
- Azure OpenAI model access approved (GPT-4o, GPT-4o-mini, text-embedding-3-large)
- Resource providers registered
- ACS phone number provisioned

### Q5: "Do we need to make a recommendation re: SpeechCascade or VoiceLive?"

**Yes — SpeechCascade is recommended.** See Section 5 for the full decision matrix. Key reasons:
1. VoiceLive is not available in Canada East (only eastus2, westus2, swedencentral, southeastasia)
2. SpeechCascade allows custom phrase lists for SAP/Enbridge domain terms
3. SpeechCascade gives more control over the voice pipeline for compliance
4. SpeechCascade is the default mode and more mature

### Q6: "Should a Foundry KB be built and their knowledgebase docs be indexed and vectorized ahead of time?"

**Yes — absolutely.** This is critical for maximizing the 2-day workshop. See Section 6. Options:
- **Option A (Recommended):** Azure AI Search + text-embedding-3-large — index PDFs before May 5
- **Option B:** Azure AI Foundry Knowledge Base — upload PDFs to Foundry project

**Owner:** Sergey + Enbridge AI COE. **Deadline:** April 30.

### Q7: "Do we anticipate requiring access to any additional data outside of SAP or their documents?"

**For the rapid prototype, likely no.** The two data sources are:
1. **SAP data** — via custom gateway (for live account/service data retrieval)
2. **PDF call centre scripts** — indexed as a knowledge base (for agent guidance)

**Potential additional data sources to discuss during the workshop:**
- Customer authentication/identity data (for caller verification)
- CRM data (if separate from SAP)
- Previous call history / interaction logs
- Enbridge's "data marketplace" — evaluate if any datasets would enhance the agent's responses

### Q8: "Confirmation of roles that need to take part in the workshop?"

**See Section 11 for the complete breakdown.** Summary:

| Role | Required? | Days |
|------|-----------|------|
| AI COE Team (hands-on-keyboard, 2-3 people) | **CRITICAL** | Day 1 + Day 2 |
| Call Centre Technology Team (Eric, Arjun) | **CRITICAL** | Day 1 + Day 2 |
| SAP Team representative | **CRITICAL** | Day 1 (mandatory), Day 2 (on-call) |
| Business Process SME (Home Move knowledge) | **CRITICAL** | Day 1 + Day 2 |
| Data & Analytics Team | IMPORTANT | Day 1 (advisory) |
| Network / Infrastructure Admin | IMPORTANT | On-call both days |
| Executive Sponsor (Michael) | IMPORTANT | Day 1 kickoff + Day 2 demo |

**Missing from the original list but recommended:**
- **Network/Infrastructure Admin** — On-call for firewall/connectivity issues with SAP
- **Enbridge Security/Compliance** — Brief touchpoint on Day 1 if compliance requirements affect agent design

---

## Appendix A: Default Terraform Variable Values

| Variable | Default | Recommended for PoC |
|----------|---------|-------------------|
| `container_cpu_cores` | 2 | 2 |
| `container_memory_gb` | 4.0Gi | 4.0Gi |
| `container_app_min_replicas` | 5 | **1–2** (reduce for PoC) |
| `container_app_max_replicas` | 50 | **5–10** (reduce for PoC) |
| `redis_sku` | MemoryOptimized_M10 | MemoryOptimized_M10 |
| `cosmosdb_sku` | M30 | M30 (or M25 for cost savings) |
| `location` | (required) | canadaeast |
| `openai_location` | null (uses location) | eastus2 (if models unavailable in canadaeast) |
| `acs_data_location` | United States | Canada |
| `enable_voice_live` | true | **false** (SpeechCascade recommended) |
| `enable_acs_email` | true | true |
| `aoai_pool_size` | 50 | 50 |
| `tts_pool_size` | 100 | 100 |
| `stt_pool_size` | 100 | 100 |

## Appendix B: Deployment Commands Reference

```bash
# Full deployment (infra + apps)
azd up

# Infrastructure only
azd provision

# Apps only (after infra)
azd deploy

# Tear down everything
azd down --force --purge

# Switch environments
azd env select <name>

# View deployed values
azd env get-values

# View resource group
az resource list --resource-group <rg-name> --output table

# Set voice mode
export ACS_STREAMING_MODE=MEDIA       # SpeechCascade (recommended)
export ACS_STREAMING_MODE=VOICE_LIVE  # VoiceLive (if chosen)

# Use local Terraform state (dev only)
azd env set LOCAL_STATE "true"
azd provision
```

## Appendix C: Cost Estimate Summary (PoC - 2 Days)

| Resource | Estimated 2-Day Cost |
|----------|---------------------|
| Azure OpenAI | $5–20 (usage-based) |
| Speech Services | $5–15 (usage-based) |
| ACS (PSTN calls) | $2–10 (usage-based) |
| Cosmos DB (M30) | ~$18 (prorated) |
| Redis Enterprise (M10) | ~$15 (prorated) |
| Container Apps | ~$5–10 (prorated) |
| Storage, KV, AppConfig | <$1 |
| Monitoring | <$2 |
| **Total estimated 2-day PoC cost** | **~$50–100** |

> Note: Costs will continue if resources are not torn down after the workshop. Use `azd down --force --purge` to destroy all resources.

---

*Document prepared by the Microsoft delivery team. Last updated April 22, 2026.*
