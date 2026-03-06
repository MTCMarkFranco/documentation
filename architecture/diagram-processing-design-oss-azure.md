# Design Document: Engineering Diagram Processing Agent (OSS Perception on Azure + Microsoft-Native Orchestration)

## 1. Purpose
Design an engineering-grade pipeline that ingests breaker control wiring diagrams (AutoCAD-originated) and produces a high-accuracy, auditable connectivity model.

This design uses:

- Microsoft-native services for ingestion, orchestration, storage, schema normalization, agent experience, and governance.
- An optional **OSS computer vision microservice** hosted in **Azure** (container) to improve **symbol + wire recognition** where required.

## 2. Goals and non-goals

### Goals
- Extract **connectivity** (what is wired to what), not just descriptions.
- Produce **structured JSON** with evidence (page + coordinates) and confidence.
- Support **human-in-the-loop (HITL)** review and correction.
- Enable incremental improvement via labeled feedback and retraining.
- Keep all compute and storage on **Microsoft/Azure**.

### Non-goals
- Replacing the authoring CAD workflow.
- Perfect end-to-end automation without HITL (initially).
- Reverse-engineering full electrical semantics beyond connectivity (e.g., full protection logic) in v1.

## 3. Inputs and assumptions

### Inputs
- Source drawings are **DWG/DXF** from AutoCAD.
- Ingestion artifact is one of:
  - **PDF** (preferred, vector-derived) and/or
  - **High-resolution PNG** per page (300–600 DPI recommended)

### Assumptions
- A standard export SOP exists (plot style, line weights, fonts) to reduce variance.
- A baseline symbol taxonomy exists (breaker, coil, NO/NC contact, terminal block, junction dot, etc.).

## 4. Target outputs

### 4.1 Canonical JSON (connectivity + evidence)
The system produces a versioned JSON document per diagram:

- `document`: metadata (source, pages, export settings, hashes)
- `texts[]`: OCR tokens and grouped text blocks with bounding boxes
- `symbols[]`: detected symbols with class, bbox/mask, and associated text tags
- `terminals[]`: terminal/pin candidates with coordinates and association to symbols/TBs
- `wires[]`: wire traces as polylines (or skeleton masks) with optional labels
- `connections[]`: graph edges between terminals/pins, with evidence links
- `needs_review[]`: ambiguous items with suggested questions

### 4.2 Human-readable summary
- A generated summary for engineers: device inventory, wire list, connection list, and unresolved ambiguities.

### 4.3 Visualization artifacts
- Overlay images showing detections, wire traces, snapped endpoints, and flagged ambiguities.

## 5. High-level architecture

### 5.1 Services (Microsoft)
- **Microsoft 365**: SharePoint/OneDrive/Teams as content source
- **Power Automate** or **Azure Logic Apps**: triggers and orchestration
- **Azure Blob Storage**: raw files + page images + intermediate artifacts
- **Azure Container Apps** (or **AKS**) for hosting the OSS perception microservice
- **Azure AI Vision** + **Azure AI Document Intelligence** for OCR/layout (baseline text extraction)
- **Azure AI Content Understanding** for schema-driven normalization into canonical JSON
- **Azure OpenAI** for constrained normalization, cross-reference resolution, and explanation generation
- **Azure SQL** or **Cosmos DB** for structured persistence
- **Azure AI Search** (optional) to index extracted entities and enable retrieval
- **Application Insights** + **Log Analytics** for observability
- **Copilot Studio** for HITL review UX and Q&A over extracted results

### 5.2 OSS perception microservice
A containerized inference service that performs:

- Symbol detection (and optionally segmentation)
- Terminal/pin keypoint detection
- Wire/line segmentation (wire pixels) and/or polyline extraction

The service returns strictly bounded JSON (no free-form narrative).

### 5.3 Data flow (summary)
1) File lands in SharePoint/OneDrive
2) Orchestrator copies to Blob and records metadata
3) Render pages to PNG (if PDF) + normalize image quality
4) OCR/layout extraction via Azure AI
5) OSS perception inference (symbols/wires) via container endpoint
6) Connectivity builder creates graph and snaps endpoints
7) Content Understanding (or Azure OpenAI schema mode) emits canonical JSON
8) Validation rules flag issues → HITL in Copilot Studio
9) Persist results and index for search

## 6. Components and responsibilities

### 6.1 Ingestion + rendering
**Responsibilities**
- Fetch file from M365 and store in Blob
- Split PDF into pages, render to high DPI images
- Normalize rotation/skew and optional denoise

**Outputs**
- `raw/` original file
- `pages/` page images
- `metadata.json` (hashes, timestamps, source)

### 6.2 OCR/layout extraction (Microsoft)
**Responsibilities**
- Extract text tokens and layout regions
- Return bounding boxes and confidence

**Outputs**
- `ocr.json` with tokens, bounding boxes, confidences

### 6.3 OSS perception service (Azure Container Apps/AKS)
**Responsibilities**
- Detect symbols (class + bbox/mask)
- Detect terminal/pin keypoints
- Extract wire pixels or polylines

**Outputs**
- `perception.json` (bounded schema; see section 7)
- optional `overlay.png` for QA

### 6.4 Connectivity builder (deterministic)
**Responsibilities**
- Convert wire mask/polyline to a graph
- Resolve junction dots and line crossings
- Snap endpoints to terminals/pins with thresholds
- Emit `connections[]` with evidence

**Outputs**
- `graph.json`
- `snap_report.json` (threshold decisions + ambiguous cases)

### 6.5 Schema normalization and reasoning
**Responsibilities**
- Combine OCR + perception + graph into canonical JSON
- Normalize device tag naming
- Resolve cross-references (“see sheet”, “wire continues”)
- Generate constrained explanations and review questions

**Outputs**
- `canonical.v1.json`
- `summary.md` (human-readable)

### 6.6 HITL review (Copilot Studio)
**Responsibilities**
- Display overlay artifacts and extracted graph
- Ask targeted questions for ambiguous items
- Capture corrections (ground truth)

**Outputs**
- `corrections.json` saved for retraining + reprocessing

## 7. OSS perception microservice contract

### 7.1 Endpoint
- `POST /v1/infer`

### 7.2 Request (example)
```json
{
  "request_id": "...",
  "schema_version": "1.0",
  "image": {
    "blob_uri": "https://.../pages/page-001.png",
    "page": 1,
    "dpi": 600
  },
  "classes": {
    "symbols": ["breaker", "relay_coil", "contact_no", "contact_nc", "terminal_block", "junction_dot"],
    "terminals": ["pin", "terminal"],
    "wires": ["wire"]
  },
  "thresholds": {
    "symbol_confidence": 0.4,
    "terminal_confidence": 0.4,
    "wire_confidence": 0.3
  },
  "return_debug_overlays": true
}
```

### 7.3 Response (example)
```json
{
  "request_id": "...",
  "model": {
    "name": "oss-detector",
    "version": "2026.02.04",
    "labels_version": "symtax-0.1"
  },
  "page": 1,
  "symbols": [
    {
      "id": "sym-001",
      "class": "breaker",
      "confidence": 0.93,
      "bbox": {"x": 120, "y": 88, "w": 210, "h": 140},
      "mask_rle": null
    }
  ],
  "terminals": [
    {
      "id": "term-001",
      "class": "pin",
      "confidence": 0.86,
      "point": {"x": 315, "y": 155},
      "bbox": {"x": 306, "y": 146, "w": 18, "h": 18},
      "attached_symbol_id": "sym-001"
    }
  ],
  "wires": [
    {
      "id": "wire-001",
      "confidence": 0.81,
      "polyline": [{"x": 315, "y": 155}, {"x": 600, "y": 155}, {"x": 600, "y": 420}],
      "mask_rle": null
    }
  ],
  "artifacts": {
    "overlay_blob_uri": "https://.../artifacts/page-001-overlay.png"
  },
  "timing_ms": {"preprocess": 18, "infer": 142, "postprocess": 25}
}
```

### 7.4 Contract requirements
- All coordinates are in **pixel space** of the provided image
- Include `model.name` + `model.version` in every response for auditability
- No free-form text fields besides IDs/classes
- Must be deterministic for identical inputs (same container image + model weights)

## 8. Deployment design (Azure)

### 8.1 Recommended hosting: Azure Container Apps
Use **Azure Container Apps** when you want:

- simpler ops than AKS
- autoscaling based on queue depth / HTTP concurrency
- easy private networking via VNet integration

Use **AKS** if you require:

- advanced GPU scheduling
- custom inference stacks with tight control

### 8.2 Network and identity
- Place services in a VNet where possible
- Use **Private Endpoints** for Blob/DB/Search
- OSS microservice uses **Managed Identity** to read inputs and write debug overlays to Blob
- Restrict egress (deny-by-default) if feasible

### 8.3 Security controls
- Encryption at rest (Azure-managed)
- RBAC scoped to least privilege
- Store secrets in **Azure Key Vault** (if any)
- Disable public container ingress unless required; prefer internal-only with a private API gateway pattern

### 8.4 Observability
- Emit structured logs per stage: `request_id`, `doc_hash`, `page`, `model_version`
- Track:
  - OCR token counts + confidence
  - detection counts per class
  - wire length distribution
  - connection ambiguity rate
  - HITL rate

## 9. Accuracy strategy

### 9.1 Metrics (what to measure)
- **Symbol detection**: mAP per class
- **Terminal/pin**: keypoint precision/recall
- **Wire segmentation**: IoU/F1
- **Connectivity**: edge-level precision/recall (correct endpoint pairs)
- **Document-level**: % diagrams with zero high-severity errors after HITL

### 9.2 Validation rules (deterministic)
- Every wire endpoint must snap to a terminal/pin or be flagged
- Junction dots imply connectivity; crossings without dots do not (configurable)
- Duplicate wire labels across sheets must reconcile or be flagged

### 9.3 HITL gating
- Route to HITL when:
  - confidence below threshold
  - ambiguous snapping candidates
  - unconnected fragments above threshold count

## 10. Retraining and continuous improvement

### 10.1 Data collection
- Store corrected labels from HITL as:
  - symbol boxes/masks
  - terminal keypoints
  - wire masks/polylines
  - ground-truth connection edges

### 10.2 Training cadence
- Start with monthly retraining; move to weekly when volume grows
- Use canary rollout for new model versions

### 10.3 Drift detection
- Monitor distribution shifts (fonts, line weights, background noise, symbol variants)
- Trigger targeted labeling tasks when drift is detected

## 11. Risks and mitigations

### Risk: topology errors despite good detection
Mitigation:
- invest in junction/crossing handling + validation
- require HITL for ambiguous endpoints

### Risk: export variability from CAD
Mitigation:
- enforce export SOP (PDF + 600 DPI for dense sheets)
- version export settings in metadata

### Risk: OSS container governance
Mitigation:
- pin model weights + container digest
- strict contract (bounded JSON only)
- private networking + audit logs

## 12. Implementation plan (phased)

### Phase 0 — Export SOP + evaluation set
- Standardize PDF/PNG export
- Create labeled evaluation set (10–30 diagrams)

### Phase 1 — OCR + indexing + overlays
- OCR/layout extraction
- searchable index and annotated outputs

### Phase 2 — OSS perception + graph v1
- deploy perception container
- build connectivity with snapping + validation

### Phase 3 — HITL + retraining loop
- Copilot Studio review app
- correction capture + retraining pipeline
