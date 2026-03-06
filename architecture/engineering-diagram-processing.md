# Engineering Diagram Processing (Breaker Control Wiring)

## Context and constraints
You want a **diagram processing agent** that can ingest breaker control wiring diagrams (often dense, symbol-heavy, and label-heavy), and output a highly accurate understanding of:

- Components (breaker, relays, coils, contacts, terminal blocks, etc.)
- Text labels (wire numbers, terminal IDs, device tags, cross-references)
- Connections (what is wired to what)
- A structured representation (a “netlist” / connectivity graph) plus a human-readable explanation

Constraints:

- Everything must run on **Microsoft cloud/runtime** (Azure + Microsoft 365)
- Prefer Microsoft AI services (Visio, Azure AI Vision, Azure AI Document Intelligence, Azure AI Content Understanding, Azure OpenAI)
- If needed for accuracy, it is acceptable to run an **open-source (OSS) model** for a sub-step (e.g., symbol/wire recognition) **inside Azure**, typically as a containerized microservice
- Highest practical accuracy (favor deterministic + verifiable extraction over “best-effort narration”)

Note: the Teams URL you provided isn’t directly accessible from an offline agent environment. The approach below assumes you can provide the image/PDF directly (or store it in SharePoint/OneDrive/Blob Storage) so the pipeline can fetch it.

---

## Recommendation (what I would build)
Build a **hybrid extraction system**:

1. **Deterministic document understanding first** (OCR + layout + key-value/region extraction)
2. **Specialized symbol + wire detection** using either:
  - Microsoft: Azure AI Vision custom model(s), or
  - OSS: a containerized detector/segmenter hosted on Azure (only for this perception step)
3. Convert detections into a **connectivity graph** with explicit coordinates, terminals, and edges
4. Use Azure OpenAI **only after** you have structure, to:
   - normalize naming, resolve cross-references, and explain results
   - propose fixes when extraction is uncertain
5. Add **validation rules + human-in-the-loop review** to push accuracy to engineering-grade

This consistently outperforms “give the image to a model and ask it to describe wiring” because wiring diagrams require **exact topology** and **symbol-level correctness**.

---

## Optional: OSS perception in Azure (recommended escape hatch)
If Microsoft vision models are not sufficient for symbol/wire recognition, the clean pattern is to introduce an OSS-only **perception microservice** while keeping the rest of the system Microsoft-native.

### What the OSS service is allowed to do
- Input: a single page image (PNG) + configuration (symbol classes, thresholds)
- Output: strictly bounded JSON with:
  - `symbols[]` (bbox/mask, class, confidence)
  - `terminals[]` (bbox/keypoints, confidence)
  - `wires[]` (polyline/skeleton, confidence)
  - `debug_artifacts` (optional overlays)

### What it should NOT do
- It should not “explain” the diagram, invent labels, or infer cross-sheet meaning
- It should not write to your database directly

### How it plugs into the Microsoft pipeline
- Orchestrate with **Logic Apps** / **Power Automate** / **Azure Container Apps** jobs
- Store all inputs/outputs in **Blob Storage**
- Normalize into your canonical schema with **Azure AI Content Understanding** (or Azure OpenAI schema mode)
- Enforce validation + HITL in **Copilot Studio**

### Azure hosting guardrails (to keep it enterprise-safe)
- Run in **Azure Container Apps** or **AKS** with private networking
- Use **Managed Identity** for Blob access; avoid embedded keys
- Log every inference with document hash + model version for auditability
- Keep a “review required” threshold gate: low-confidence items must go to HITL

---

## Target outputs (make accuracy measurable)
Aim for structured outputs that can be validated:

- **Entities**: device tags, symbols, terminals, text blocks, jumpers
- **Edges**: wire segments with endpoints anchored to terminals or symbol pins
- **Evidence**: bounding boxes / page coordinates for every extracted item
- **Confidence + ambiguity set**: items needing review

Example JSON shape (illustrative):

```json
{
  "document": { "source": "...", "pages": 1 },
  "symbols": [
    { "id": "K1", "type": "relay", "bbox": [x,y,w,h], "text": ["K1"], "confidence": 0.92 },
    { "id": "Q1", "type": "breaker", "bbox": [x,y,w,h], "text": ["Q1"], "confidence": 0.95 }
  ],
  "terminals": [
    { "id": "TB1:12", "bbox": [x,y,w,h], "confidence": 0.88 }
  ],
  "wires": [
    { "id": "W-102", "label": "102", "polyline": [[x1,y1],[x2,y2],...], "confidence": 0.81 }
  ],
  "connections": [
    { "from": "Q1:A1", "to": "TB1:12", "wire": "W-102", "evidence": {"page": 1} }
  ],
  "needs_review": [
    { "reason": "wire label ambiguous", "refs": ["W-102"], "suggested_questions": ["Is this wire 102 or 120?"] }
  ]
}
```

---

## Microsoft-only architecture

### Ingestion and orchestration
- **SharePoint / OneDrive / Microsoft Teams**: source of CAD exports, PDFs, and images
- **Power Automate** (or **Logic Apps**) triggers:
  - new file uploaded / updated
  - route to processing pipeline

### Source formats (AutoCAD-originated diagrams)
Your originals are in AutoCAD format (typically DWG/DXF). Under a “Microsoft-only processing stack” constraint, the practical approach is:

- Treat DWG/DXF as an **upstream authoring format**.
- Convert to a **processable interchange** using Microsoft tooling before AI extraction.

Recommended Microsoft-only conversion options:

1) **Visio (Professional / Plan 2) as a CAD intake tool**
  - Import/open DWG/DXF in Visio.
  - Export to **PDF** (for layout + OCR) and/or to a **high-resolution PNG** (for symbol + wire detection).
  - If feasible, keep a Visio copy (VSDX) as a normalized “view format” even if it’s not fully semantic.

2) **If DWG/DXF import is not viable in your environment**
  - Establish a standard operating procedure (SOP) that the engineering team publishes **PDF** (and optionally 300–600 DPI PNG) to SharePoint/OneDrive as the ingestion artifact.

Why this matters for accuracy:

- AI services operate best on consistent, high-resolution inputs. A stable export path removes a huge amount of variance across AutoCAD versions, plot styles, and fonts.
- Even when you can’t recover “true connectivity objects” from DWG, exporting from a vector source generally yields cleaner lines/text than scanning paper.

### Storage
- **Azure Blob Storage**: raw documents, page images, intermediate artifacts
- **Azure SQL** or **Cosmos DB**: structured extraction outputs (entities/edges/review states)

### Core AI extraction
Use a two-lane strategy depending on input type:

**Lane A — If you can normalize into Visio (including CAD import)**
- **Microsoft Visio** as the normalization step and (when available) canonical format
- Best case: diagram is authored in Visio with true connectors + metadata (highest accuracy)
- Common AutoCAD case: DWG/DXF imported into Visio
  - You typically **do not** get semantic connectors automatically
  - But you can standardize rendering/export and preserve vector fidelity

**Lane B — For PDFs / raster images (most common ingestion artifact)**
- **Azure AI Vision** (OCR + image analysis) for robust text extraction
- **Azure AI Document Intelligence** for layout-aware OCR (reading order, regions, tables where applicable)
- **Azure AI Content Understanding** for schema-driven multimodal extraction (when you can define what you want extracted and want consistent JSON)
- For symbol/wire perception:
  - **Azure AI Vision (Custom)** for symbol detection/segmentation (train on your symbol library), or
  - An **OSS perception container** hosted in Azure (see “Optional: OSS perception in Azure”)

### Reasoning, normalization, and explanation
- **Azure OpenAI** to:
  - normalize tags (e.g., `TB1-12` vs `TB1:12`)
  - resolve cross-reference text (“see sheet 4”, “from wire 102”) into structured links
  - produce human-readable narratives and checklists
  - generate “review questions” for low-confidence regions

### Search and retrieval (optional but very useful)
- **Azure AI Search**:
  - index extracted entities and their evidence coordinates
  - enable “find all diagrams with breaker Q1” or “show all wires labeled 102”
  - store embeddings for semantic lookup (e.g., “trip circuit”, “closing coil”, “52a contact”)

### Observability and audit
- **Application Insights** + **Log Analytics**:
  - store per-stage confidence, error rates, and drift
  - track which pages/symbols caused review

### Agent front-end (review and interaction)
- **Copilot Studio** for a review/QA experience:
  - show extracted graph summary
  - allow the user to answer targeted questions
  - write corrections back as “gold labels” for continuous improvement

---

## High-accuracy pipeline (PDF/raster lane)

### 0) CAD-to-ingestion artifact (when original is DWG/DXF)
Goal: convert AutoCAD drawings into consistent inputs for AI.

- Preferred: use **Visio** to import DWG/DXF and export to PDF + high-DPI PNG
- Alternative: publish a standard plotted PDF from your CAD process into SharePoint/OneDrive

Minimum recommended export characteristics:

- PDF text should be selectable when possible (improves OCR and label fidelity)
- If exporting images: 300 DPI minimum; 600 DPI for dense wiring and tiny terminal labels
- Consistent plot style and line weights

### 1) Preflight (quality normalization)
Goal: reduce OCR and detection errors.

- Split PDF into pages (image per page)
- Normalize resolution (prefer ≥300 DPI equivalent)
- Detect and fix rotation / skew
- If the diagram has a title block, capture it as metadata

### 2) Text extraction (OCR + layout)
Goal: extract wire numbers, terminal IDs, device tags, references.

- Run **Azure AI Vision OCR** (fast, strong for printed text)
- Run **Document Intelligence** when layout context matters (grouping, regions)
- Output text with bounding boxes, confidence, and page coordinates

### 3) Symbol and terminal detection
Goal: identify the symbol inventory and terminal anchor points.

- Train **Azure AI Vision Custom model** on your standard symbol set:
  - breaker symbols, relay coils/contacts, terminal blocks, connectors
  - include variants from different vendors/standards
- Detect terminal points/pins (either as part of symbol detection, or as a dedicated class)

### 4) Wire extraction and connectivity reconstruction
Goal: build a graph: terminals ↔ wires ↔ terminals.

Because wires are topology, not semantics:

- Use vision outputs to find candidate wire traces (wires often appear as long thin lines)
- Convert wire traces into polylines and snap endpoints to nearest terminals/pins
- Resolve junctions and “dot” connections (if present)

Key accuracy tactic: **all snapping should be evidence-based** with thresholds + a “needs review” list when ambiguous.

### 5) Cross-reference resolution
Goal: link “wire continues” / “sheet references” / “terminal references”.

- Use Azure OpenAI with strict schema output to convert reference text into structured edges:
  - “From TB2-7 / To TB1-12”
  - “See page X”

### 6) Validation (make it engineering-grade)
Goal: detect impossible or suspicious results.

Implement deterministic checks (these are cheap and dramatically improve trust):

- Every connection must terminate on a known pin/terminal (or be flagged)
- Wire labels should be consistent across occurrences
- Detect unconnected wire fragments and duplicates
- Validate device tag patterns against your naming standard (e.g., IEC/ANSI conventions)

### 7) Human-in-the-loop (HITL)
Goal: hit near-100% where it matters.

- Present only the ambiguous items to a reviewer (Copilot Studio)
- Persist corrections as training data
- Re-run only impacted stages

---

## Model selection guidance (Azure OpenAI)
Use a **two-model strategy**:

- A **larger, best-reasoning model** for:
  - cross-reference resolution
  - consistency checks and explanation generation
  - generating targeted clarifying questions
- A **smaller/cheaper model** for:
  - normalization of labels
  - simple mappings and formatting tasks

Important: do *not* rely on the LLM to “see” topology unless you must. Let the vision/layout stack produce structure first; use the LLM to interpret and validate the structure.

---

## Fine-tuning: does it make sense?
### My opinion: fine-tune only for perception (symbols), not for reasoning

For breaker control wiring diagrams, the dominant failure modes are:

- symbol misclassification (coil vs contact, normally-open vs normally-closed)
- missed/incorrect text (wire numbers, terminal IDs)
- incorrect connectivity reconstruction (wires crossing vs connected)

Those are **perception problems**, not language problems.

So:

**Good candidates for training/fine-tuning**:
- Microsoft path: **Azure AI Vision Custom** model trained on your symbol library and your drawing styles
- OSS-in-Azure path: train/fine-tune your detector/segmenter (symbols, terminals, dots, wire masks) and deploy as a container

**Usually not a good candidate**:
- Fine-tuning an Azure OpenAI text model to “describe what to look for” in diagrams.
  - You’ll still be limited by what the OCR/symbol detector extracted.
  - Fine-tuned narration can sound confident while still being wrong about topology.

### When I *would* consider fine-tuning an LLM
Only if you have a large, high-quality dataset of paired examples like:

- input: extracted structure (symbols + OCR + wire traces)
- output: canonical netlist + explanations + rules

and you need consistent, domain-specific normalization beyond what prompting + constraints can achieve.

In practice, you’ll get more accuracy per dollar by investing in:

- better labeled symbol training data
- stronger validation and HITL loops
- switching to Visio-native sources where possible

---

## “If you can get Visio”: the accuracy fast-path (even with AutoCAD originals)
If your engineering organization can standardize on **Visio as the interchange/normalization layer**, do it.

Why:

- connectors are explicit objects with endpoints
- shapes can carry metadata (device tag, pin names)
- you can enforce templates and naming rules
- you avoid the hardest problem: topology from pixels

Strategy:

- Best case: use Visio templates/stencils for your symbol set and require shape data for device tags/terminals
- AutoCAD-originated case: import DWG/DXF into Visio and standardize exports (PDF/PNG) so downstream extraction is consistent
- Treat PDF/PNG as the processing view, but keep the DWG/DXF as the source of truth

---

## Implementation milestones (practical delivery plan)
1. **MVP (2–4 weeks)**
   - Ingest PDFs/images → OCR + layout → extract text labels with evidence
   - Produce searchable index + annotated image output

2. **Topology v1 (4–8 weeks)**
   - Train custom symbol detector on core symbol set
   - Build connectivity graph with snapping + review queue

3. **Engineering-grade (ongoing)**
   - Validation rules + HITL loop in Copilot Studio
   - Active learning: prioritize new training labels where the model fails
   - Continuous evaluation dashboard (precision/recall per symbol type, connection accuracy)

---

## Mermaid view (end-to-end)
```mermaid
flowchart LR
  A[Teams/SharePoint/OneDrive
  PDF/PNG/JPG] --> B[Power Automate
  Trigger]
  B --> C[Azure Blob Storage
  Raw Doc]
  C --> D[Page Rendering
  + Normalization]
  D --> E[Azure AI Vision OCR
  + Doc Intelligence Layout]
  D --> F[Azure AI Vision Custom
  Symbols/Terminals]
  E --> G[Content Understanding
  Schema JSON]
  F --> H[Connectivity Builder
  Graph + Evidence]
  G --> H
  H --> I[Validation Rules
  + Needs Review]
  I --> J[Copilot Studio
  Review UI]
  I --> K[Azure OpenAI
  Normalize + Explain]
  H --> L[(SQL/Cosmos DB)
  Entities/Edges]
  L --> M[Azure AI Search
  Index]
```

---

## What I need from you to tailor this to your exact breaker control diagrams
If you want, I can refine the pipeline and the schema to match your symbol conventions and output needs. The highest-leverage inputs are:

- 10–30 representative diagrams (mix of clean + messy)
- your symbol standard (IEC/IEEE/ANSI + any internal stencil set)
- the exact output you want (netlist format, CSV, JSON, Visio reconstruction, etc.)
- tolerance for HITL (e.g., “review only if confidence < 0.9”)
