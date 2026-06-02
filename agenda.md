# **Day 1 – Architecture Design Session (ADS)**

**Objective:** Align on patterns, validate existing implementations, and define a **clear, scoped plan for Day 2 execution** (with EDW as the primary focus).

## **Morning Block (2.5–3 hrs)**

### **1. Current State & Pattern Review (MCP + Hosting Models)**

* Review existing implementations:
  * Self-hosted MCP vs Vendor-hosted MCP
  * Community / third-party / first-party MCP approaches
* Assess architecture fidelity and alignment to best practices
* Identify risks, inconsistencies, and potential technical debt
* Validate:
  * Deployment patterns
  * Hosting strategy
  * Integration models

**Outcome:**  
Clear understanding of “what exists today” + architectural gaps and risks

### **2. Governance, Security, and Operational Guardrails**

* Policy management and control model (APIM / gateway patterns)
* Tooling governance:
  * Allow / disallow tools exposed via MCP
  * Control over self-hosted vs vendor capabilities
* Security considerations:
  * Telemetry, logging, and correlation
  * Prompt injection and AI security discussion
  * Observability and auditability

**Outcome:**  
Defined governance + security model to guide platform standardization

## **Lunch Break**

## **Afternoon Block (2.5–3 hrs)**

### **3. Enterprise Data Warehouse (EDW) – Pattern Definition**

* Deep dive into EDW as the **primary use case**
* Discuss:
  * Data access patterns (e.g., Synapse and similar sources)
  * MCP wrapper design for data retrieval
  * Making enterprise data AI-ready
* Identify 1–2 **target use cases** for prototyping

**Outcome:**  
Agreed EDW architecture pattern + candidate prototype scenarios

### **4. Day 2 Planning – Prototype Scope & Success Criteria**

* Define **non-negotiable deliverables for Day 2**
  * At least one working EDW MCP use case
  * Preferably two scenarios if feasible
* Prioritize:
  * What must be built vs what is aspirational
* Validate:
  * Environment readiness (data access, subscriptions, tooling)
  * Required assets (repos, identities, licenses)

**Outcome:**

* Final prioritized backlog
* Clear “definition of success” for Rapid Prototype day

# **Day 2 – Rapid Prototype (Focused Build Day)**

**Objective:** Deliver **tangible working outcomes** focused on EDW (not theory).

## **Morning Block (2.5–3 hrs)**

### **1. Build – EDW MCP Prototype (Core Use Case)**

* Stand up MCP container/service
* Implement:
  * Data retrieval from EDW source (e.g., Synapse)
  * One functional MCP tool endpoint
* Integrate with AI interaction layer (if applicable)

**Outcome:**  
Working prototype for **primary EDW use case**

### **2. Extend – Secondary Use Case / Pattern Validation**

* Build or simulate second EDW scenario (if time allows)
* Validate:
  * Reusability of pattern
  * Extensibility of MCP approach
* Refine implementation approach

**Outcome:**  
Validated pattern across at least one (ideally two) use cases

## **Lunch Break**

## **Afternoon Block (2.5–3 hrs)**

### **3. Hardening & Integration**

* Apply:
  * Governance controls (APIM / gateway where applicable)
  * Logging and telemetry hooks
* Validate:
  * Security considerations
  * Operational readiness

**Outcome:**  
Prototype aligned with enterprise expectations (not just a demo)

### **4. Readout & Next Steps**

* Walkthrough of implemented solution(s)
* Document:
  * Architecture pattern
  * Key decisions and trade-offs
* Define:
  * Next steps for productionization
  * Open gaps and follow-ups

**Outcome:**

* Tangible deliverable(s)
* Clear path forward (no ambiguity post-session)

# **What this reflects (from the call)**

* Day 1 = **Review + Patterns + Planning (not theoretical only)**
* Day 2 = **Execution with mandatory EDW outcome**
* Success = **Tangible deliverables, not just discussion**
