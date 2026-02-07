<p align="center">
  <img src="https://img.shields.io/badge/WeMakeDevs-Hackathon%202026-FF6B6B?style=for-the-badge&logo=dev.to&logoColor=white" alt="WeMakeDevs Hackathon 2026"/>
  <img src="https://img.shields.io/badge/Built%20with-Tambo%20AI-00D4FF?style=for-the-badge&logo=openai&logoColor=white" alt="Built with Tambo AI"/>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15"/>
</p>

<h1 align="center">🛡️ Sentinel</h1>

<p align="center">
  <strong>Generative UI for DevOps — AI decides the UI. Humans decide the actions.</strong>
</p>

<p align="center">
  <em>An AI-orchestrated control plane that dynamically composes the right operational UI for each incident,<br/>while humans retain control over all critical actions.</em>
</p>

---

## 🎯 The Problem

When an incident strikes, engineers face **dashboard fatigue**:
- 📊 **15+ Grafana dashboards** to check
- 🔍 **Dozens of log streams** to grep through
- ⏱️ **Precious MTTR** wasted context-switching
- 🧠 **Cognitive overload** when every second counts

**Current tools show you everything. Sentinel shows you exactly what matters.**

---

## 💡 Our Solution

Sentinel is a **Generative UI** platform that uses AI to dynamically compose operational interfaces tailored to each incident. Instead of forcing engineers to navigate static dashboards, the AI:

1. **Analyzes** the incident description and system state
2. **Selects** the most relevant UI components
3. **Composes** a focused interface for that specific incident
4. **Respects** human authority over all destructive actions

### 🔐 The Core Philosophy

> **"AI decides the UI. Humans decide the actions."**

The AI can render any combination of diagnostic components, but **critical actions like rollbacks always require human approval**.

---

## ✨ Key Features

### 🤖 AI-Composed Interfaces
The AI dynamically selects and renders components based on incident context — no more hunting through irrelevant dashboards.

### 🛡️ Human-in-the-Loop Safety
Critical operations require explicit human approval. The AI can recommend a rollback, but YOU press the button.

### 📊 9 Specialized Components

| Component | Type | Description |
|-----------|------|-------------|
| **IncidentHeader** | Persistent | Severity badge, environment, status indicator |
| **IncidentOverviewPanel** | Generative | AI confidence %, affected services, root cause hypothesis |
| **ClusterTopologyMap** | Generative | Interactive service mesh with health & latency visualization |
| **RootCauseTimeline** | Generative | Chronological event correlation for debugging |
| **LogStreamConsole** | Interactive | Live log streaming with regex filtering |
| **RemediationRunbook** | Interactive | Step-by-step checklist with progress tracking |
| **GitHubDiffCard** | Analysis | Syntax-highlighted code diffs for suspected commits |
| **PostMortemReport** | Report | Auto-generated incident summary with export |
| **RollbackApprovalCard** | 🔐 Human-Gated | Version rollback with explicit approval required |

### 🔧 MCP Tools Integration
Built-in tools for Kubernetes cluster status, event correlation, and rollback recommendations — all exposed via Model Context Protocol.

---

## 🎬 Demo Scenarios

Try these prompts to see Sentinel in action:

```
"The checkout service is throwing 500 errors after the last deployment"
```
→ AI renders: IncidentHeader → IncidentOverviewPanel → ClusterTopologyMap → RootCauseTimeline → RollbackApprovalCard

```
"Show me the logs for the payment service and help me find the memory leak"
```
→ AI renders: LogStreamConsole with suggested regex filters

```
"Generate a post-mortem for the notification service outage"
```
→ AI renders: PostMortemReport with timeline, actions, and lessons learned

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A [Tambo AI API key](https://tambo.co/dashboard) (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sentinel.git
cd sentinel

# Install dependencies
npm install

# Initialize Tambo (creates .env.local with your API key)
npx tambo init

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and describe an incident!

---

## 📦 Dependencies

Running `npm install` will automatically install all required packages:

### Core Dependencies
| Package | Version | Description |
|---------|---------|-------------|
| `next` | ^15.5.7 | React framework for production |
| `react` | ^19.1.1 | UI library |
| `react-dom` | ^19.1.1 | React DOM bindings |

### Tambo AI
| Package | Version | Description |
|---------|---------|-------------|
| `@tambo-ai/react` | ^0.74.1 | Tambo React components |
| `@tambo-ai/typescript-sdk` | ^0.89.0 | Tambo TypeScript SDK |

### UI Components & Styling
| Package | Version | Description |
|---------|---------|-------------|
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `@tailwindcss/oxide` | ^4.1.17 | Tailwind CSS engine |
| `@radix-ui/react-dropdown-menu` | ^2.1.16 | Accessible dropdown menus |
| `@radix-ui/react-popover` | ^1.1.15 | Accessible popovers |
| `radix-ui` | ^1.4.3 | Radix UI primitives |
| `lucide-react` | ^0.554.0 | Icon library |
| `framer-motion` | ^12.23.24 | Animation library |

### Rich Text Editor (TipTap)
| Package | Version | Description |
|---------|---------|-------------|
| `@tiptap/react` | ^3.17.1 | TipTap React integration |
| `@tiptap/extension-document` | ^3.17.1 | Document extension |
| `@tiptap/extension-hard-break` | ^3.17.1 | Hard break extension |
| `@tiptap/extension-mention` | ^3.17.1 | Mention extension |
| `@tiptap/extension-paragraph` | ^3.17.1 | Paragraph extension |
| `@tiptap/extension-placeholder` | ^3.17.1 | Placeholder extension |
| `@tiptap/extension-text` | ^3.17.1 | Text extension |
| `@tiptap/suggestion` | ^3.17.1 | Suggestion extension |

### Data Visualization & Utilities
| Package | Version | Description |
|---------|---------|-------------|
| `recharts` | ^3.5.0 | Charting library |
| `highlight.js` | ^11.11.1 | Syntax highlighting |
| `react-markdown` | ^10.1.0 | Markdown renderer |
| `dompurify` | ^3.3.0 | HTML sanitizer |
| `class-variance-authority` | ^0.7.1 | Class variance utility |
| `use-debounce` | ^10.1.0 | Debounce hook |
| `streamdown` | ^1.6.7 | Streaming utilities |
| `json-stringify-pretty-compact` | ^4.0.0 | JSON formatting |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Sentinel UI                           │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Chat      │  │  Generative │  │  Human-in-the-Loop  │  │
│  │  Interface  │──│  Components │──│  Approval System    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                    Tambo AI SDK                              │
│         (Component Registry + Tool Execution)                │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ K8s MCP  │  │ GitHub   │  │ Logs     │  │ Metrics  │     │
│  │  Tool    │  │  Tool    │  │  Tool    │  │  Tool    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TailwindCSS 4 |
| **AI Framework** | [Tambo AI](https://tambo.co) — Generative UI SDK |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Code Highlighting** | Highlight.js |
| **Styling** | Tailwind + Radix UI primitives |

---

## 📂 Project Structure

```
sentinel/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   └── chat/             # Main chat interface
│   ├── components/
│   │   ├── sentinel/         # 9 custom DevOps components
│   │   ├── tambo/            # Tambo integration components
│   │   └── ui/               # Shared UI primitives
│   ├── lib/
│   │   └── tambo.ts          # Component & Tool registry
│   └── services/             # API integrations
└── public/                   # Static assets
```

---

## 🤝 Why Tambo AI?

Sentinel is built on **Tambo AI**, a framework for building Generative UI applications. Tambo allows us to:

- **Register components** with schema definitions the AI can understand
- **Define tools** (MCP) for the AI to fetch data
- **Stream UI** as the AI composes responses
- **Handle voice input** for hands-free incident reporting

Learn more: [docs.tambo.co](https://docs.tambo.co)

---

## 👥 Team

Built with ❤️ for **WeMakeDevs Hackathon 2026**

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>🛡️ Sentinel — Because every second counts during an incident.</strong>
</p>
