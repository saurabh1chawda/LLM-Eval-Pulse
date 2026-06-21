# LLM Eval Pulse 

[![Vite Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)
[![Tech Stack](https://img.shields.io/badge/stack-React--Vite--CSS-blue.svg)](#)
[![Candidate](https://img.shields.io/badge/candidate-Saurabh%20Chawda-purple.svg)](#)

An advanced **LLM evaluation & observability dashboard** built as a proof-of-work prototype for the **ML/LLM Platform Team at Agoda**. 

LLM Eval Pulse has been upgraded to **V2** with the **Handoff Approved Polish**, resolving critical code quality, performance, and UI/UX issues identified during technical and design audits.

---

## 🚀 Key Features & Architectural Upgrades

### 1. Robust CSV Parser (ReDoS-Safe)
*   **State-Machine Character Scanner:** Replaced regular-expression splits with an $O(N)$ character-by-character scanner. This protects the browser thread against **Catastrophic Backtracking (ReDoS)** and parses nested commas, quotes, and escaped quotes (`""`) flawlessly.
*   **Index Safety Guards:** Validates columns safely (`cols[promptIndex] || ""`) to prevent out-of-bound errors.
*   **Guardrails:** Enforces a strict limit of **50 items** per test set to prevent browser thread locking.

### 2. Multi-Language Tokenizer (`calculateJaccard`)
*   Calculates semantic Jaccard similarity:
    $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
*   **Unicode Property Escapes:** Strips punctuation globally via `/[\p{P}\p{S}]/gu` (including advanced mathematical symbols and symbols in multiple scripts).
*   **Thai Script Support:** Detects Thai character blocks (`\u0e00-\u0e7f`) and tokenizes at the character level, bypassing whitespace splitting limitations in Thai text.

### 3. Visual Text Diff (Inline Alignment)
*   Replaced blocky pills with a clean inline layout.
*   Matching text is rendered as natural plain spacing-separated text.
*   Mismatched words are wrapped inline in a desaturated red text decoration strikethrough with a subtle red background highlight (`.diff-mismatch`).

### 4. Memory & Storage Safety
*   **Unmount Cleanup:** Clears active benchmark execution loops (`benchmarkIntervalRef`) on tab-navigation or component unmount.
*   **Crash-Safe LocalStorage Syncing:** Namespaces all keys with an `agoda_eval_` prefix and wraps serialization writes in a try-catch helper, preventing browser crashes on `QuotaExceededError`.
*   **Financial Value Scaling:** Scaled the accumulated efficiency savings to a realistic corporate baseline ($5,280.00 and $10.00 increments) and formatted with `toLocaleString`.

---

## 📂 Project Structure

```
Agoda_TPM/
├── FINAL_PRD.md            # Product Requirements Document (STEP PM Framework)
├── PRD_ALIGNED_V2.md       # Product Trio & Executive Aligned V2 Spec
├── User_Feedback_Log.json  # Log of usability issues collected during User Testing
├── README.md               # Repository Overview & Architecture (This File)
├── USER_GUIDE.md           # Step-by-step Walkthrough & Local Demo Guide
├── package.json            # Project dependencies
├── vite.config.js          # Vite config
├── index.html              # Main index
└── src/
    ├── main.jsx            # Entry point
    ├── App.jsx             # React dashboard logic, state-machines, and algorithms
    ├── App.css             # Premium CSS, glassmorphism, sliders, and charts
    └── index.css           # Design system tokens and globals
```

---

## 🛠️ Quick Start

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository and navigate into the folder:
   ```bash
   cd Agoda_TPM
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Spin up the local development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL in your browser (usually `http://localhost:5173`).
