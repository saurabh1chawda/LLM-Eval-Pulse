# PRODUCT REQUIREMENTS DOCUMENT · PROOF-OF-WORK PROTOTYPE V2
## LLM Eval Pulse: Pre-Release Workbench & MLOps Platform Integration

**Status:** Aligned (V2)
**Date:** June 21, 2026
**Target Audience:** Agoda ML/LLM Platform Team & Applied AI Engineers
**Maintainer:** Saurabh Chawda, Candidate for Technical Product Manager (ML & LLM Platforms)

---

## 1. Objectives & Target Personas

The V2 version expands the platform from a live production monitoring system into a **Pre-Release Evaluation and Automated Deployment Gate**.

### Expanded Personas
1.  **ML Engineers:** Pre-release verification of prompts and models using Golden Test Sets before deploying to production.
2.  **Platform/MLOps Engineers:** Defining canary deployment gates, configuring automated rollback webhook behaviors, and triggering training pipelines.
3.  **VPs & AI Directors:** Long-term SLA reporting and historical ROI trends.

---

## 2. Feature Specifications

### Feature 1: Golden Test Set Registry
*   **Template Download:** A button to download a sample CSV containing header guidelines: `test_id`, `prompt`, `reference_context`, `ground_truth`.
*   **Dataset Registry List:** A table showing uploaded test sets.
*   **Import Guardrails:**
    *   Validation check for missing columns.
    *   Strict size limit of **50 items** per test set to prevent browser thread locking.
*   **Sample Preloaded Registry:** The app comes preloaded with standard sets: `hotel-cancellation-tests`, `bangkok-search-golden-set`.

### Feature 2: Pre-Release Version Workbench
*   **Interactive Play:** Select a Test Set and execute a benchmark comparing `agoda-custom-llama-v1` vs `agoda-custom-llama-v2`.
*   **Paged Asynchronous Batch Runner:** Runs the test cases in batches of 5 items per second, rendering a visual progress bar and completion metrics.
*   **Jaccard Similarity index:** Simulates semantic similarity using a token overlap algorithm:
    $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
    where $A$ and $B$ are tokenized word sets of the response and the ground truth.
*   **Visual Text Diff:** Highlights differences in prompt outputs (matching words vs additions/deletions) when inspecting bench results.
*   **Ready-to-Ship Gate:** Renders a badge indicating `READY TO PROMO` (if average faithfulness > 0.75, relevance > 0.80) or `BLOCKED`.

### Feature 3: MLOps Canary Gate Configuration
*   **Live Traffic Splitter:** A visual slider to split traffic (e.g. 90% Production Llama-v1, 10% Canary Llama-v2).
*   **Confirmation Modal:** Changing traffic splits triggers a modal: *"Are you sure you want to alter live production traffic routing to [X]%?"*
*   **Webhook cURL Generator:** Dynamic code snippet showing the webhook command generated to trigger retraining or external alerts:
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{...}' https://platform.agoda.com/api/v2/canary-gate
    ```

### Feature 4: Executive SLA & VP ROI Panel
*   **LocalStorage Persistence:** Telemetry logs and 6-week historical metrics are saved to the browser's Local Storage to persist across page refreshes.
*   **Dynamic Savings KPI Card:** Displays accumulated ROI:
    $$\text{Savings} = (\text{Cost Diff between v1 and v2}) \times (\text{Requests Redirected})$$
*   **Weekly SLA Charts:** Visual scrolling SVG charts showing SLA compliance (latency < 200ms, quality > 0.80) over 6 weeks.
*   **Markdown Audit Log Export:** A button to download/copy a clean markdown report of the benchmark run for compliance files.

---
*PRD Approved unanimously by CEO, CPO, Head of Design, and Head of Engineering.*
