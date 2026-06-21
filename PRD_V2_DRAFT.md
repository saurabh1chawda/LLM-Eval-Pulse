# PRODUCT REQUIREMENTS DOCUMENT · DRAFT V2
## LLM Eval Pulse V2: Pre-Release Workbench & MLOps Platform Integration

**Status:** Draft (Waiting for Alignment & Approval)
**Date:** June 21, 2026
**Target Audience:** Agoda ML/LLM Platform Team, MLOps Engineers, & Applied AI Leads
**Maintainer:** Saurabh Chawda, Candidate for Technical Product Manager (ML & LLM Platforms)

---

## 1. Context & Objectives (V2 Scope Expansion)

While V1 successfully delivered live production monitoring, alerting, and manual rollback controls, it left gaps in pre-release evaluation and production infrastructure integration. 

The goal of V2 is to expand the platform from a *monitoring-only* tool to a complete **Pre-Release Evaluation and Automated Deployment Gate (MLOps Platform)**.

### Target Personas & Focus
1.  **ML Engineers:** Pre-release verification of prompts and models using Golden Test Sets before deploying to production.
2.  **Platform/MLOps Engineers:** Defining canary deployment gates, configuring automated rollback webhook behaviors, and triggering training pipelines.
3.  **VPs & AI Directors:** Long-term SLA reporting and historical ROI (COPQ) trends.

---

## 2. Key Features

### Feature 1: Golden Test Set Registry
*   **The Repository:** A central store for managing test cases.
*   **Dataset Schema:** Supports uploading a CSV or JSON containing:
    *   `test_id`, `prompt`, `reference_context` (expected retrieval), and `ground_truth` (expected correct output).
*   **Registry UI:** A table displaying uploaded test sets, item counts, target LLM service, and update logs.

### Feature 2: Pre-Release Version Workbench
*   **Side-by-Side Playground:** A workbench UI where engineers select a Test Set and run a batch job comparing two prompt variants or model configurations (`v1` vs `v2`).
*   **Simulated Batch Run:** Clicking "Execute Benchmark" triggers a simulated execution over the test set, displaying a scrolling progress bar.
*   **Comparison Report Card:** Displays:
    *   *Side-by-Side Quality Diff:* Faithfulness and Relevance averages.
    *   *Semantic Similarity:* LLM output comparison to the Ground Truth using token-match/embeddings simulation.
    *   *Cost & Latency Projection:* Anticipated cost per 1k tokens and p95 latency.
    *   *Promotion Gate Indicator:* Explicit `READY TO SHIP` or `BLOCKED` status based on compliance criteria.

### Feature 3: MLOps Configuration & Canary Gate Policy
*   **Canary Rule Engine:** Interface to configure active canary parameters:
    *   Canary traffic percentage allocation (e.g. 10% traffic to V2).
    *   Canary gate criteria (e.g. "Trigger auto-rollback if Canary Faithfulness is < 0.75 in the first 30 minutes").
*   **Traffic Allocation Control:** A visual slider/donut chart showing live traffic split (e.g. 90% Prod, 10% Canary).
*   **Trigger Configurations:** Webhook setups to notify downstream CI/CD pipelines (e.g. trigger retraining if quality remains degraded after rollback).

### Feature 4: Executive SLA & VP Reporting Panel
*   **Long-Term SLA Tracker:** A chart depicting weekly SLA compliance (latency under 200ms, quality score above 0.80) over a rolling 6-week period.
*   **COPQ Financial Trend:** A multi-week timeline showing how COPQ spend has declined since adopting automated platform gates.
*   **Simulated Export:** Click to copy or simulate downloading a PDF summary report.

---

## 3. Data Schema Additions

### Golden Test Set JSON Item
```json
{
  "test_set_id": "bangkok-search-golden-set",
  "items": [
    {
      "test_id": "test-001",
      "prompt": "Find hotels in Bangkok near BTS Skytrain under $80.",
      "reference_context": "BTS-adjacent hotels: Siam Boutique ($75), Skytrain Lodge ($65).",
      "ground_truth": "Suggest Siam Boutique and Skytrain Lodge because they are adjacent to the BTS and under $80."
    }
  ]
}
```

### Canary Gate Telemetry log
```json
{
  "canary_run_id": "canary-llama-v2-run-4",
  "traffic_percentage": 10,
  "status": "EVALUATING",
  "rules_defined": [
    { "metric": "faithfulness", "min_allowed": 0.75 }
  ],
  "current_score": 0.88,
  "trigger_actions": {
    "on_breach": "rollback_and_alert",
    "on_success": "promote_to_100_percent"
  }
}
```
