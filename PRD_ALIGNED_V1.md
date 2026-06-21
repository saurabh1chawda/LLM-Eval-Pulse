# PRODUCT REQUIREMENTS DOCUMENT · PROOF-OF-WORK PROTOTYPE
## LLM Eval Pulse: Live LLM Evaluation & Observability Dashboard

**Status:** Aligned (V1)
**Date:** June 21, 2026
**Target Audience:** Agoda ML/LLM Platform Team & Applied AI Engineers
**Maintainer:** Saurabh Chawda, Candidate for Technical Product Manager (ML & LLM Platforms)

---

## 1. North Star Goal & Value Proposition

### North Star Goal
*   **Reduce Mean Time to Detect (MTTD) LLM quality degradation from days to under 4 hours.**
*   Detect and surface silent quality regressions in production (hallucinations, low faithfulness, poor relevance) in near-real-time.

### Business Value: Cost of Poor Quality (COPQ)
*   LLM calls that yield hallucinated, unfaithful, or irrelevant responses represent direct financial waste and damage traveler retention.
*   **COPQ Formula:** 
    $$\text{COPQ} = \sum (\text{Token Costs where Faithfulness or Relevance} < 0.70)$$
*   By actively monitoring and alerting on COPQ, the platform helps teams optimize spend and justify model migrations.

---

## 2. User Persona & Pain Points

### Primary Persona
*   **ML Engineers & Applied AI Developers:** Responsible for shipping RAG search, recommendation engines, and customer support prompts. They need to monitor production quality and troubleshoot drifts immediately.

### Key Pain Points addressed in MVP
1.  **Silent Quality Regressions:** No automated alerting when response quality degrades.
2.  **Telemetry Fragmentation:** Metrics (cost, latency, quality scores) live in siloed dashboards.
3.  **Ad-hoc Version Comparison:** Benchmarking prompt V1 vs V2 requires manual Python scripts.

---

## 3. Architecture & Data Ingestion System

To ensure zero impact on Agoda's critical path booking/search latency, the evaluation engine runs **fully asynchronously out-of-path**.

```
[ Agoda Core Service ] --(Async Log Stream)--> [ Kafka / Telemetry Queue ]
                                                       |
                                                       v
                                            [ Eval Judge Service ]
                                                       |
                                                       v
                                           [ LLM Eval Pulse DB ]
```

### Telemetry JSON Schema (Mock Production Stream)
Each production event ingested must contain:
```json
{
  "request_id": "req-98765-abc",
  "timestamp": "2026-06-21T10:00:00Z",
  "model_id": "agoda-custom-llama-v1",
  "service_name": "hotel-recommendations-RAG",
  "prompt": "Find family hotels in Bangkok under $100 with pool.",
  "response": "Here are 3 hotels matching your criteria...",
  "context_retrieved": "Hotel A: $90 pool, Hotel B: $110 pool, Hotel C: $85 no-pool...",
  "metrics": {
    "latency_ms": 180,
    "prompt_tokens": 120,
    "completion_tokens": 85,
    "cost_usd": 0.000305,
    "faithfulness": 0.65,
    "relevance": 0.90
  }
}
```

---

## 4. Key Features (MVP Scope)

### Feature 1: Live Pulse Dashboard
*   **Primary Metrics:** Live counters for Total Requests, Average Latency (p95), Total Spend, and cumulative **Cost of Poor Quality (COPQ)**.
*   **Quality Trends:** Live time-series charts showing Faithfulness and Answer Relevance over time.
*   **Staging vs. Production Toggle:** Segregate staging benchmarks (pre-release) and production data.

### Feature 2: Visual Alerting Engine
*   **Frictionless Alert Builder:** 3-click visual configuration using sliding threshold controls.
*   **Sliding Window Alerting:** E.g., *"Alert if average faithfulness is < 0.80 over a rolling 15-minute window (min. 50 samples)."*
*   **Actionable Incidents:** If triggered, the alert shows up in the Incidents panel with a **Quick Action** button:
    *   `Rollback Model` (switches service to a designated fallback version).
    *   `Simulate Webhook Trigger` (pushes payload to external endpoints).

### Feature 3: Version Overlay Benchmark
*   Instead of a complex standalone workbench, engineers can overlay historical model runs or prompt versions (e.g., `agoda-custom-llama-v1` vs. `agoda-custom-llama-v2`) on the main charts to see latency, cost, and eval score diffs side-by-side.

---

## 5. Do-No-Harm Metrics & Guardrails
*   **Eval Latency Overhead:** 0ms critical path impact (fully async).
*   **Alert Fatigue Threshold:** < 20% dismissed false alarms. The engine uses sliding sample sizes to smooth spikes.
*   **Eval Run Costs:** Judge evaluation cost must not exceed 2% of total production inference spend.

---
*PRD Approved unanimously by CEO, CPO, Head of Design, and Head of Engineering.*
