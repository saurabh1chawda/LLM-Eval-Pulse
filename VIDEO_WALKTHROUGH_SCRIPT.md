# Video Walkthrough Script: LLM Eval Pulse (Complete Prototype Walkthrough)

* **Format:** Screen recording with voiceover (split-screen/picture-in-picture with facecam recommended).
* **Target Duration:** 5 to 6 minutes.
* **Goal:** Showcase Saurabh Chawda’s Technical PM capabilities to the Hiring Manager by demonstrating a complete, user-centric, and robust walkthrough of the LLM Platform prototype.

---

## 🎬 Act 1: Intro & Observability (0:00 - 1:15)

**[Visual Setup]**
* *Screen shows the **Production Observability** tab of the LLM Eval Pulse prototype.*
* *Live metrics are scrolling, showing sparkline charts for Faithfulness, Relevance, and Spend.*
* *Hover over the scorecards: Total Requests, P95 Latency, Cumulative Cost, and Cost of Poor Quality (COPQ).*

**[Audio/Voiceover]**
> *"Hi [Hiring Manager's Name], I’m Saurabh Chawda. As a candidate for Agoda’s Technical Product Manager role on the ML & LLM Platform team, I’d like to walk you through **LLM Eval Pulse**.*
>
> *This platform coordinates pre-release validation and online observability to solve one major goal: **reduce the Cost of Poor Quality (COPQ) and guarantee quality SLA compliance** for Agoda’s customer-facing LLM services, like our hotel recommendations RAG pipeline.*
>
> *We are looking at the **Production Observability** tab. For **MLOps and Platform Engineers**, the main pain point is tracking live model health. Here, they get real-time scorecards, including COPQ—which represents the financial waste of serving degraded responses.*
>
> *Below, we have scrolling SVG sparklines monitoring quality metrics and token costs, and a console showing live webhook payloads triggered when anomalies arise."*

---

## 🚨 Act 2: Alert Rules & Live Simulator Triggers (1:15 - 2:00)

**[Visual Setup]**
* *Scroll down on the **Production Observability** tab to the **Alert Rules Configuration** panel.*
* *Adjust the threshold slider. Fill in the form values (Metric: Faithfulness, Condition: Less Than, Threshold: 0.70, Window: 15, Min Samples: 10).*
* *Click **Add Alert Rule**. See it added to the list.*
* *Click the **Quality Drift (v1)** simulator trigger button under "Active Simulation Control Panel".*
* *Watch the rolling sparkline dip, triggering a red alert card in the **Active Incidents Console**.*
* *Click **Healthy Stream** to resolve it.*

**[Audio/Voiceover]**
> *"A critical pain point for MLOps is **brittle alerts** that create alarm fatigue. *
>
> *We solved this by building an interactive **Alert Rules Configuration** panel. Engineers can customize metrics (like Faithfulness or Latency), thresholds, evaluation window sizes, and minimum sample counts to ensure high statistical significance.*
>
> *To test these rules, we built a **Live Simulation Control Panel**. By triggering a 'Quality Drift', we simulate a RAG retrieval failure. Notice how the sparkline instantly dips, the incident log captures the drift, and the terminal displays the alert JSON webhook payload.*
>
> *Clicking 'Healthy Stream' recovers the telemetry loop, marking the incident as resolved—demonstrating real-time, closed-loop alerting."*

---

## 🧪 Act 3: Pre-Release Version Workbench & Word Diff (2:00 - 3:15)

**[Visual Setup]**
* *Click on the **Pre-Release Workbench** tab.*
* *Select `bangkok-search-golden-set (5 cases)` in the dropdown.*
* *Set Model A to `agoda-custom-llama-v1` and Model B to `agoda-custom-llama-v2`.*
* *Click **Execute Benchmark** and watch the progress bar run.*
* *Show the `READY TO PROMO` gate status.*
* *Expand a case row and click **Diff View**, showing the inline text diff highlights.*

**[Audio/Voiceover]**
> *"Next, let's address our **Applied AI Developer persona**. *
>
> *Their pain point is **blind deployment regressions**. They modify prompts or switch model parameters but don’t know if it breaks downstream responses until it hits production.*
>
> *The **Pre-Release Workbench** provides a side-by-side comparison sandbox. Clicking 'Execute Benchmark' runs the test cases in the background with a visual progress bar. Once complete, it calculates Jaccard similarity and Faithfulness aggregates, generating a clear `READY TO PROMO` or `BLOCKED` deployment gate badge.*
>
> *Agoda operates globally, so we built **Thai character-level tokenization** into the similarity analyzer. If Thai text is detected, the tokenizer splits at the character level to calculate Jaccard accurately.*
>
> *For prompt debugging, our premium **inline word diff inspector** renders normal matching text, while unmatching text is formatted cleanly as a red strikethrough span. No blocky, rounded pills that clutter the screen—maintaining natural reading flows."*

---

## 📂 Act 4: Test Set Registry & ReDoS-Safe CSV Parser (3:15 - 4:15)

**[Visual Setup]**
* *Click on the **Test Set Registry** tab.*
* *Show the "Copy Sample Template" button.*
* *Hover over the upload dropzone to show the hover scaling.*
* *Drag and drop a sample CSV file.*
* *Show the success banner.*

**[Audio/Voiceover]**
> *"To run workbench benchmarks, developers need custom datasets. But a common pain point is **unstable file parsing**. Large CSV uploads often freeze the browser thread, and standard split regexes crash on quotes or commas inside cells.*
>
> *In the **Test Set Registry**, we implemented a custom **state-machine CSV scanner**. By traversing character-by-character, it parses quoted columns and escaped double quotes safely with $O(N)$ speed, eliminating **Regular Expression Denial of Service (ReDoS)** risks.*
>
> *We’ve also added client-side guardrails: enforcing a hard limit of 50 test cases and strict header checks to protect memory."*

---

## 🎛️ Act 5: MLOps Config & Canary split (4:15 - 5:00)

**[Visual Setup]**
* *Click on the **MLOps Config & Canary** tab.*
* *Drag the **Canary Split Slider**.*
* *Click **Apply Canary Traffic Split**.*
* *Confirm the split update on the glassmorphic overlay modal.*
* *Highlight the dynamically updated webhook cURL snippet in the terminal.*

**[Audio/Voiceover]**
> *"Once a model is marked ready-to-ship, our **MLOps persona** takes over. Their pain point is **high-risk, manual routing updates**.*
>
> *In the **MLOps Config** tab, engineers use an interactive range slider to allocate traffic splits. To prevent accidental production changes, we built a two-factor confirmation gate. Applying the split opens a premium **glassmorphic modal** that overlays the screen, blurring background components.*
>
> *Confirming the split updates the server and dynamically generates an updated **cURL API webhook snippet** inside the terminal display, ready to copy and paste into automated deployment pipelines."*

---

## 📊 Act 6: VP Dashboard & Report Download (5:00 - 5:45)

**[Visual Setup]**
* *Click on the **Executive Reports (SLA)** tab.*
* *Point to the **Accumulated Efficiency Savings** card.*
* *Point to the SVG compliance sparkline area fills.*
* *Click **Download Executive Summary Report**.*
* *See the markdown report file download directly in the browser's download manager, showing `"Downloaded Report!"` feedback on the button.*

**[Audio/Voiceover]**
> *"Finally, we align with our **AI Leadership and VP personas**. Their pain point is **measuring platform ROI and long-term compliance**.*
>
> *Here, they see the **Accumulated Efficiency Savings** card, scaled to realistic corporate metrics. Below, custom SVG sparklines styled with linear area gradients display compliance trends.*
>
> *To prevent browser quota crashes, all data is synced under namespaced `agoda_eval_` LocalStorage keys wrapped in try-catch guards.*
>
> *With one click on **Download Executive Summary Report**, the platform downloads a dynamically generated markdown audit report file directly to their device, containing SLA percentages and cost audits."*

---

## 👋 Act 7: Summary & Call to Action (5:45 - 6:15)

**[Visual Setup]**
* *Switch back to the Production Observability tab.*
* *Transition back to facecam.*

**[Audio/Voiceover]**
> *"By building LLM Eval Pulse, we’ve connected the developer sandbox, MLOps safety gates, and executive metrics into a high-fidelity platform.*
>
> *I’m excited to bring this product-driven mindset and technical depth to Agoda's LLM Platform Team. Thank you for your time, and I look forward to discussing how I can add value to the team in our upcoming interview. Thank you!"*
