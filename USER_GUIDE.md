# USER GUIDE: LLM EVAL PULSE (V2 POLISH)

This guide provides a step-by-step walkthrough to test the new V2 features, including Jaccard similarity, Thai localization, ReDoS-safe CSV uploads, Canary splits, and LocalStorage persistence.

---

## 🏃 Step 1: Launch the Application

1. Open a terminal in the project directory (`Agoda_TPM/`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL in your browser (usually `http://localhost:5173`).

---

## 🟢 Step 2: Explore the V2 Polish UI

Navigate through the main tabs in the dashboard:
*   **Production Observability:** Scrolling SVG sparklines for Faithfulness, Relevance, Cost, and COPQ. Features custom alert rule sliders, backdrop-blur alerts, and real-time logs.
*   **Pre-Release Workbench:** The comparison playground where you run side-by-side prompt testing and review word diff highlights.
*   **Test Set Registry:** Dataset manager supporting custom CSV imports.
*   **MLOps Config & Canary:** Canary deployment parameters, confirm overlay modals, and copyable cURL snippets.
*   **Executive Reports (SLA):** Weekly SLA trend sparklines and accumulated efficiency savings tracking.

---

## 🧪 Step 3: Test Multi-Language Tokenizer (Thai Support)

1. Switch to the **Pre-Release Workbench** tab.
2. Select a Golden Test Set (e.g., `bangkok-search-golden-set`).
3. Under individual outputs or in the test registry, verify that Agoda's local language context works by uploading or observing Thai characters:
   *   *Sample Thai Prompt:* `ค้นหาโรงแรมในกรุงเทพ` (Search hotels in Bangkok)
   *   *How it works:* The `calculateJaccard` tokenizer automatically detects the Thai character block (`\u0e00-\u0e7f`), bypasses standard space-splits, and tokenizes at the character level to calculate a precise similarity index.
4. Click **`Execute Benchmark`** and review the comparison aggregates and badge status (`READY TO PROMO` or `BLOCKED`).

---

## 📂 Step 4: Import Custom Test Cases (ReDoS-Safe CSV Parser)

1. Switch to the **Test Set Registry** tab.
2. Click **Copy Sample Template** inside the format guide.
3. Create a `.csv` file on your system. To test the robustness of the new parser:
   *   Add a cell with a quoted comma: `"Bangkok Hotel, Near BTS", ...`
   *   Add a cell with escaped double-quotes: `"Room with ""king"" size bed", ...`
4. Drag and drop or browse to upload your `.csv` file in the dropzone (observe the active hover dropzone styles).
5. Verify that:
   *   The file is loaded successfully with a green confirmation banner.
   *   Files exceeding **50 rows** or missing headers are safely rejected with a descriptive error banner.
6. Return to the **Pre-Release Workbench** and select your uploaded set from the dropdown to run evaluations.

---

## 🎛️ Step 5: Test MLOps Canary splits & Webhooks

1. Switch to the **MLOps Config & Canary** tab.
2. Adjust the **Canary Split Slider** (feel the glowing custom track and thumb styles).
3. Click **Apply Canary Traffic Split**.
4. Review the glassmorphic modal overlay confirming the routing change. Click **Confirm Routing Change**.
5. Check the **Webhook cURL Integration** terminal payload. It dynamically reflects the namespaced JSON split payload and is ready to copy.

---

## 📊 Step 6: Review SLA Reports & Persistence

1. Switch to the **Executive Reports (SLA)** tab.
2. Note the scorecards:
   *   **Accumulated Efficiency Savings** displays realistic corporate value (starting at `$5,280.00` and incrementing by `$10.00` during canary splits).
3. Refresh your web browser.
4. Open the Developer Tools console (`F12`) -> Application -> Local Storage.
5. Notice that all keys are now securely prefixed with `agoda_eval_` (e.g., `agoda_eval_efficiencySavings`), keeping storage clean, namespaced, and safe from crashing on storage overflows.
