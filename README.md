# ⚡ mlh project 1 - Bolt V2 AI Web Application Builder & ChatGPT Unlimited

A next-generation, full-stack AI Web Application Builder and ChatGPT interface built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**. Features an interactive Live Preview canvas, real-time code editor, responsive device switcher, file explorer, and zero-subscription unlimited AI generation.

![Stack](https://img.shields.io/badge/Project-MLH%20Project%202-blue)
![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Tailwind%20%7C%20Vite-purple)
![AI Engine](https://img.shields.io/badge/AI%20Engine-Multi--Provider%20%7C%20Unlimited-green)
![License](https://img.shields.io/badge/License-MIT-emerald)

---

## 📸 Interface & Workspace Screenshots

### 1. Bolt V2 Hero & Model Selector Interface
![Bolt V2 Hero Screen](docs/images/bolt_hero_screen.jpg)

### 2. Interactive Workspace, Live Code Preview & AI Assistant
![Interactive Workspace Canvas](docs/images/workspace_live_preview.jpg)

---

## 📊 Project Flowchart & System Architecture (MLH Project 2)

### 1. High-Level System Flow Diagram (Mermaid)

```mermaid
graph TD
    %% User Entry & Hero Interface
    subgraph HERO["⚡ Hero Screen (BoltStyleChat)"]
        A1["👤 User Prompt Input"] --> A2["🎯 Model Selector (Sonnet / GPT-4o / DeepSeek R1)"]
        A2 --> A3["📁 Attachments / GitHub / Figma Import"]
        A3 --> A4["🚀 Click Send / Submit Prompt"]
    end

    %% AI Dispatcher & Stream
    subgraph ENGINE["🤖 Core AI Engine (aiBuilderEngine / aiEngine)"]
        A4 --> B1{"Provider Selector"}
        B1 -- "Default" --> B2["⚡ Unlimited Built-in Engine"]
        B1 -- "Local" --> B3["🦙 Ollama Host (http://localhost:11434)"]
        B1 -- "Cloud API" --> B4["🔑 OpenAI / Groq / Gemini Endpoint"]
        
        B2 & B3 & B4 --> C1["🧠 DeepSeek R1 Reasoning Stream (<think> block)"]
        C1 --> C2["📦 Multi-File Code Generation"]
        C2 --> C3["[1/3] Analyze Requirements & App Architecture"]
        C2 --> C4["[2/3] Generate index.html, styles.css & script.js"]
        C2 --> C5["[3/3] Dynamic In-Memory Asset Bundling"]
    end

    %% Live Workspace & Execution
    subgraph WORKSPACE["💻 Interactive Workspace (Workspace.tsx)"]
        C5 --> D1["💬 Left Panel: Chat Thread & Step Progress Cards"]
        C5 --> D2["📱 Right Canvas: Live Sandboxed Preview (Iframe)"]
        C5 --> D3["📝 Right Canvas: Real-time Code Editor"]
        C5 --> D4["📁 Right Canvas: Interactive File Explorer"]

        D1 --> E1["🔄 Iterative Refinement Input ('Add dark mode')"]
        E1 --> A4

        D2 --> F1["📱 Viewport Switcher (Desktop / Tablet / Mobile)"]
        D3 --> F2["💾 One-Click Code Export & Download"]
    end
```

---

### 2. Detailed ASCII Data & Execution Flowchart

```text
===================================================================================
                       MLH PROJECT 2 - COMPLETE EXECUTION FLOW
===================================================================================

[ USER INTERFACE ]
  │
  ├─ 1. Home Screen (BoltStyleChat.tsx)
  │    ├── Custom Geometric V Logo & Ray Gradient Background
  │    ├── Model Dropdown: Sonnet 4.5 | Opus 4.5 | Haiku 4.5 | GPT-4o | Gemini 2.0
  │    ├── File Attachments (.txt, .md, .js, .py, .html, .csv)
  │    └── Submit Button ➔ User prompt: "Build a Snake Game"
  │
[ AI PROCESSING PIPELINE ]
  │
  ├─ 2. AI Router (aiBuilderEngine.ts / aiEngine.js)
  │    ├── Check Config: Provider (Built-in / Ollama / OpenAI / Groq)
  │    ├── If DeepSeek R1 selected ➔ Stream <think> step-by-step reasoning thoughts
  │    └── Stream real-time progress steps:
  │         [✓] Step 1: Analyzing requirements & designing app structure
  │         [✓] Step 2: Generating HTML, CSS & JavaScript modules
  │         [✓] Step 3: Compiling assets & initializing preview environment
  │
[ DYNAMIC ASSET BUNDLER ]
  │
  ├─ 3. In-Memory Code Assembler
  │    ├── Constructs index.html (DOM structure)
  │    ├── Injects styles.css into <style> head
  │    └── Injects script.js into <script> footer
  │
[ LIVE CANVAS WORKSPACE ]
  │
  ├─ 4. Interactive Workspace (Workspace.tsx)
  │    ├── LEFT PANEL:
  │    │    ├── Message thread history & AI response
  │    │    ├── Step-by-step progress cards
  │    │    └── Iterative prompt box (Refine app: "Add high score board")
  │    │
  │    └── RIGHT PANEL (Canvas Drawer):
  │         ├── 📱 Live Preview (Sandboxed <iframe> via srcDoc)
  │         ├── 💻 Code Editor (Live text editor with real-time preview re-bundle)
  │         ├── 📁 File Explorer (Directory grid of project files)
  │         ├── 📱 Device Viewport Toggle (Desktop / Tablet / Mobile)
  │         └── 💾 Code Export (One-click project download)
  │
===================================================================================
```

---

## 🌟 Key Features & Capabilities

### 🚀 1. Bolt V2 Hero & UI
- **Ambient Ray Background**: Futuristic gradient backdrop with custom geometric V logo emblem.
- **Model Selector**: Switch between **Sonnet 4.5**, **Opus 4.5**, **Haiku 4.5**, **GPT-4o**, and **Gemini 2.0**.
- **Attachment & Import Shortcuts**: Upload code files, attach images, or import from **GitHub** and **Figma**.

### 💻 2. Live Workspace & Code Canvas
- **Live Sandboxed Preview**: Test generated HTML5/CSS3/JavaScript applications inside an embedded, isolated `<iframe>`.
- **Real-Time Code Editor**: Editable text workspace with language tags that updates the live preview automatically.
- **Interactive File Explorer**: Directory tree showing all generated files (`index.html`, `styles.css`, `script.js`).
- **Responsive Viewports**: Switch between **Desktop**, **Tablet**, and **Mobile** preview dimensions.
- **One-Click Code Export**: Download all generated project source files directly to your machine.

### 🧠 3. Core AI Engine & DeepSeek Reasoning
- **Unlimited Token Output**: Zero token caps, zero rate throttling, and zero subscription costs.
- **DeepSeek R1 `<think>` Block**: Expandable step-by-step thinking process display.
- **Voice Dictation & Audio Reader**: Speech-to-text input dictation and text-to-speech response reader.
- **Web Search Mode**: Synthesizes real-time online search insights into responses.

---

## 🛠️ Project Directory Structure

```text
mlh project 2/
├── docs/
│   └── images/
│       ├── bolt_hero_screen.jpg         # Hero screen interface screenshot
│       └── workspace_live_preview.jpg   # Interactive workspace canvas screenshot
├── components/
│   └── ui/
│       └── bolt-style-chat.tsx          # Hero section with prompt input & V logo
├── lib/
│   └── utils.ts                         # Shadcn UI utility helper (cn)
├── src/
│   ├── components/
│   │   └── Workspace.tsx                # Live Canvas, Code Editor, Preview iframe
│   ├── services/
│   │   └── aiBuilderEngine.ts           # Real-time project code streaming engine
│   ├── App.tsx                          # App router switching between Hero & Workspace
│   ├── main.tsx                         # React entry point
│   ├── index.css                        # Tailwind CSS v4 directives & theme tokens
│   └── types.ts                         # TypeScript interfaces
├── .env                                 # API Key & environment configuration
├── aiEngine.js                          # Standalone streaming AI core engine
├── components.json                      # Shadcn UI configuration
├── package.json                         # Dependencies & scripts
├── postcss.config.js                    # PostCSS configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript path alias configuration (@/*)
└── vite.config.ts                       # Vite configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) installed.

### 2. Installation
```bash
npm install
```

### 3. Development Server
Start the Vite development server:
```bash
npx vite --port 3000 --host
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.

### 4. Build for Production
```bash
npx vite build
```

---

## 🔑 Environment Configuration

Configure your default API Key in the `.env` file at the root directory:

```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_PROVIDER=custom
```

---

## 📜 License

Distributed under the MIT License.
