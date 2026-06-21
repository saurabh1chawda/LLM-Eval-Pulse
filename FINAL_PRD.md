# PRODUCT REQUIREMENTS DOCUMENT: LLM EVAL PULSE (V2 POLISH)

**Status:** Finalized (Handoff Approved V2)
**Date:** June 21, 2026
**Target Audience:** ML Platform Engineers, Applied AI Developers, and AI Leadership
**Maintainer:** Saurabh Chawda, Candidate for Technical Product Manager (ML & LLM Platforms)

---

## 1️⃣ Clarifying Questions

When evaluating the concept of a real-time LLM Platform Observability & Deployment Gate at Agoda, several key clarifying questions arise:
*   **Company Context & Resource Constraints:** Are we operating as a startup with limited compute resources, or a large-scale tech company like Google or Agoda? 
    *   *Assumption:* We are operating at Agoda scale (high query volume, hundreds of active models, microsecond performance requirements, and global multi-language localization including Thai). The solution must be highly optimized, lightweight, and capable of operating client-side where possible to lower server latency.
*   **Data Scopes & Target Services:** Is this platform dedicated to a single model or is it service-agnostic?
    *   *Assumption:* It is built as an enterprise-grade platform hub, starting with `hotel-recommendations-RAG` as the primary service, but supports custom test dataset uploads.
*   **Evaluation Frequency:** Are evaluations run online or offline?
    *   *Assumption:* Both. Real-time online telemetry is monitored on the production stream, and pre-release evaluation is conducted offline in a batch workbench.

---

## 2️⃣ Goal

### Primary Goal
**Ensure high SLA compliance and reduce Cost of Poor Quality (COPQ) for customer-facing LLM services.**

By establishing a strict pre-release validation gate and safe canary rollout gates, we aim to prevent degraded prompt/model versions from reaching production, thereby protecting customer experience and eliminating financial waste (COPQ).

---

## 3️⃣ User Segments

1.  **Applied AI Engineers (RAG Developers):** Focus on prompt engineering, context recall tuning, and optimizing model response outputs. They need quick feedback on prompt/model iterations before requesting production promotion.
2.  **ML Platform & MLOps Engineers:** Responsible for system stability, traffic allocation routing (canary splits), rollback protocols, and webhook setups. They need reliable API controls and automated safeguards.
3.  **AI Directors & VP of Engineering:** Focused on high-level SLA metrics, weekly trend summaries, and financial returns (Accumulated Efficiency Savings).

---

## 4️⃣ User Pain Points (Target Segment: Applied AI Engineers)

1.  **High Risk of Production Regressions:** Modifying prompts or switching models has a high risk of breaking downstream responses. Without a side-by-side pre-release comparison playground, developers deploy blind.
2.  **Slow and Fragile Custom Dataset Uploads:** Evaluating prompts against new customer datasets often crashes the browser thread due to oversized inputs, or fails entirely on CSVs with commas nested inside quotes.
3.  **Financial Waste from Degraded Responses (COPQ):** Deployed models that fail relevance/faithfulness thresholds trigger costly customer support issues and high API token costs (Cost of Poor Quality).

---

## 5️⃣ Solutions

### Solution 1: Pre-Release Workbench (Reasonable)
An interactive side-by-side sandbox comparing Model A vs. Model B against Golden Test Sets. Features an asynchronous batch runner (paging 5 items/sec) with a progress bar. Includes:
*   **Offline Similarity Scoring (Jaccard Index):**
    $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
    Upgraded Unicode tokenizer stripping punctuation (`[\p{P}\p{S}]/gu`) and segmenting Thai words at the character level.
*   **Inline Word Difference Highlight:** Clean inline text layout showing insertions/deletions with red strikethroughs and desaturated highlights.
*   **Ready-to-Ship Gate Badges:** Displays `READY TO PROMO` or `BLOCKED` based on average Jaccard Similarity (\( > 0.70 \)) and latency (\( \le 250\text{ms} \)).

### Solution 2: Golden Test Set Registry (Reasonable)
A dataset repository enabling Applied AI Engineers to upload custom CSV files. Features:
*   **ReDoS-Free State-Machine CSV Scanner:** A character-by-character scanner to parse quoted strings, nested commas, and escaped quotes safely without regular expressions.
*   **Import Guardrails:** A client-side limit enforcement rejecting files with \( > 50 \) rows or missing the `prompt` and `ground_truth` headers.

### Solution 3: Autonomous Self-Healing Canary split (Moonshot)
An automated MLOps gate routing traffic to the new model variant. If the real-time production telemetry loop detects an SLA breach (e.g. Quality SLA \( < 0.80 \) or Latency \( > 600\text{ms} \)), the platform:
1.  Triggers an automated rollback webhook reverting traffic split to `v1`.
2.  Dispatches Slack alerts to `#llm-alerts-agoda`.
3.  Dynamically triggers a prompt-optimization or model fine-tuning pipeline using the failing test cases as input.

---

## 6️⃣ Feature Prioritization (RICE-Adapted High/Medium/Low)

| Feature | Impact | Effort | Urgency | Priority |
| :--- | :---: | :---: | :---: | :---: |
| **Pre-Release Workbench (Jaccard + Word Diff)** | High | Medium | High | **P0 (Critical)** |
| **Golden Test Set Registry (CSV Scanner)** | Medium | Low | High | **P0 (Critical)** |
| **MLOps Canary Split Slider & cURL Webhook** | High | Low | Medium | **P1 (Important)** |
| **VP SLA Dashboard (LocalStorage + Savings)** | Medium | Low | Medium | **P1 (Important)** |
| **Self-Healing Webhook & Auto-Rollback (Moonshot)**| High | High | Low | **P2 (Future)** |

---

## 7️⃣ Success Metrics

### North Star Metric (Goal Alignment)
*   **Production COPQ Ratio:** The percentage of API costs wasted on degraded quality runs, targeting \( < 5\% \) overall.

### Signpost Metrics (Feature Validation)
*   **Workbench Utilization:** Number of pre-release benchmark simulations executed weekly by Applied AI Engineers.
*   **Promotion Success Rate:** Percentage of models promoted with `READY TO PROMO` status that maintain SLA compliance in their first week of production.

### "Do No Harm" Metrics
*   **Platform Overhead Latency:** Client-side load times and UI thread responsiveness (must maintain 60 FPS during CSV parses and benchmark loops).
*   **Storage Quota Footprint:** LocalStorage utilization, managed viaNamespaced storage (`agoda_eval_`) and try-catch blocks to prevent browser quota crashes.

---

## 8️⃣ Core Implementation Architecture (Handoff Spec)

### 1. Robust CSV Parsing State Machine
Client-side uploads are parsed using an iterative character scanner rather than regex:
*   Enforces index safety checks: `cols[promptIndex] || ""`
*   Rejects uploads with \( > 50 \) cases to protect browser memory.

### 2. Multi-Language Tokenizer
The Jaccard index splits inputs by character when Thai text block points (`\u0e00-\u0e7f`) are found to bypass whitespace constraints. Punctuation is stripped globally via `/[\p{P}\p{S}]/gu`.

### 3. Memory & Interval Safety
All intervals (`setInterval`) are tracked via React `useRef` handles (`benchmarkIntervalRef`) and cleared during unmount cleanups.

### 4. Executive Savings Accumulator
Calculates accumulated savings from routing rules using the formula:
$$\text{Accumulated Savings} = \text{Baseline Savings (\$5,280.00)} + (\text{Auto-routing routing steps} \times \$10.00)$$
Persisted safely in namespaced LocalStorage keys (`agoda_eval_`).
