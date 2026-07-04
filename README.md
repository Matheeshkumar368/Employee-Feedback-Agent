<div align="center">

```
███████╗███╗   ███╗██████╗ ██╗      ██████╗ ██╗   ██╗███████╗███████╗
██╔════╝████╗ ████║██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝██╔════╝██╔════╝
█████╗  ██╔████╔██║██████╔╝██║     ██║   ██║ ╚████╔╝ █████╗  █████╗  
██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║     ██║   ██║  ╚██╔╝  ██╔══╝  ██╔══╝  
███████╗██║ ╚═╝ ██║██║     ███████╗╚██████╔╝   ██║   ███████╗███████╗
╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝
```

### ✦ &nbsp; A I - P o w e r e d &nbsp; E m p l o y e e &nbsp; F e e d b a c k &nbsp; P l a t f o r m &nbsp; ✦

<br/>

[![Next.js](https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini%201.5-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)

<br/>

> **Employee Feedback Agent** is a smart HR web platform where employees share feedback  
> and an AI agent reads, understands, and turns it into useful insights for managers — automatically.

<br/>

[🚀 &nbsp;Quick Start](#-quick-start) &nbsp;·&nbsp; [✨ &nbsp;Features](#-features) &nbsp;·&nbsp; [🤖 &nbsp;How the AI Works](#-how-the-ai-works) &nbsp;·&nbsp; [🐳 &nbsp;Deploy with Docker](#-deploy-with-docker)

<br/>

---

</div>

<br/>

## 🧭 &nbsp;What is this project?

**Employee Feedback Agent** is a full-stack web application built as a college capstone project. It solves a real-world problem — companies collect employee feedback but rarely have time to read and act on it.

This platform fixes that by connecting a feedback form directly to an AI agent. The moment an employee submits feedback, the AI reads it, figures out the mood, urgency, and key topics, and shows the HR admin a clear summary — no manual reading required.

**Two types of users:**
- 👤 **Employee** — submits feedback, sees AI analysis of their own submissions
- 🛡️ **HR Admin** — manages all feedback, views charts, chats with the AI agent, reads AI-generated reports

<br/>

---

<br/>

## ✅ &nbsp;Project Requirements Checklist

| Requirement | How it's met |
|---|---|
| 🧑‍💻 Individual project with unique topic | AI-driven employee feedback analysis — unique use case |
| 💬 Prompt Engineering | Layered prompts with role assignment, few-shot examples, and temperature tuning |
| 🤖 LLM API Integration | Google Gemini 1.5 Flash via `@google/generative-ai` |
| 🗄️ Database | MongoDB Atlas (cloud NoSQL) with Mongoose |
| 🌐 Web Framework | Next.js 15 (React-based full-stack framework) |
| 🎨 Frontend | TypeScript + Tailwind CSS + Radix UI + Framer Motion |
| 🐳 Deployment | Docker (multi-stage build, docker-compose ready) |

<br/>

---

<br/>

## ✨ &nbsp;Features

<br/>

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🔐  Secure Login     →   JWT auth, role-based access control      │
│   📝  Feedback Form    →   Star rating, category, department        │
│   🤖  AI Analysis      →   Sentiment, priority, keywords, emotion   │
│   💬  AI Chat          →   Ask the AI anything about your data      │
│   📊  Analytics        →   7 live charts, trends, department scores │
│   📄  AI Reports       →   Auto-generated insights (7/30/90 days)   │
│   🏢  Admin Panel      →   Manage employees, departments, feedback  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

<br/>

### 🔐 &nbsp;Login & Security
- Employees and admins have separate login pages
- Passwords are hashed (never stored as plain text)
- Sessions use secure JWT tokens
- Pages are protected — wrong role gets redirected automatically

### 📝 &nbsp;Feedback Submission
- Simple form: pick a rating (1–5 stars), choose a category and department, write a message
- Option to submit anonymously
- After submitting, the AI starts analyzing immediately — a loading animation shows progress
- Employees can see the full AI analysis of their past submissions

### 🤖 &nbsp;AI Agent (Google Gemini 1.5 Flash)
- Every feedback gets analyzed automatically — no admin action needed
- AI detects: **mood** (positive / neutral / negative), **urgency** (high / medium / low), **emotion**, **keywords**, and gives **recommendations**
- HR admins can **chat with the AI** — ask questions like *"Which department is most stressed this month?"* and get real answers based on live data
- AI generates a full written report on demand

### 📊 &nbsp;Analytics Dashboard
- 10 summary cards (total feedback, average rating, positive %, pending count, etc.)
- 7 interactive charts — trend lines, pie charts, bar charts, histograms
- Filter by department, category, date range, sentiment, and priority
- Export data as CSV or print the dashboard

<br/>

---

<br/>

## 🤖 &nbsp;How the AI Works

<br/>

The AI doesn't just read feedback — it thinks about it like an experienced HR consultant would.

```
  👤 Employee writes feedback
           │
           ▼
  📥  Saved to MongoDB
           │
           ▼
  🧠  AI Agent (Gemini) reads:
       • Department & category
       • Star rating
       • The message text
           │
           ▼
  📋  AI returns:
       • Sentiment  →  positive / neutral / negative
       • Priority   →  high / medium / low
       • Urgency    →  immediate / normal / low
       • Emotion    →  frustrated / happy / neutral ...
       • Keywords   →  [ "workload", "management", "growth" ]
       • Recommendation  →  what HR should do next
           │
           ▼
  📊  Admin sees enriched feedback + charts + AI chat
```

<br/>

### 🧪 &nbsp;Prompt Engineering Techniques Used

| Technique | What it does |
|---|---|
| **Role Assignment** | Tells the AI to act as a "Senior HR Consultant with 20+ years experience" — better, more relevant answers |
| **Few-Shot Examples** | Shows the AI 3 sample feedbacks with correct answers before the real one — keeps output consistent |
| **Structured Output** | Forces the AI to always return clean JSON — no messy free-text parsing needed |
| **Temperature Control** | Low (0.2) for analysis = precise; High (0.7) for chat = natural conversation |
| **Context Injection** | Before every chat reply, live stats from MongoDB are fed into the AI so answers are always up to date |
| **Graceful Fallbacks** | If the AI is unavailable, the app doesn't crash — it uses smart defaults based on the star rating |

<br/>

---

<br/>

## 🛠️ &nbsp;Tech Stack

<br/>

```
╔══════════════════╦══════════════════════════════════════╗
║  What            ║  Tool / Technology                   ║
╠══════════════════╬══════════════════════════════════════╣
║  Language        ║  TypeScript                          ║
║  Framework       ║  Next.js 15 (React)                  ║
║  Styling         ║  Tailwind CSS v4                     ║
║  UI Components   ║  Radix UI + Lucide Icons             ║
║  Animations      ║  Framer Motion                       ║
║  Charts          ║  Recharts                            ║
║  Database        ║  MongoDB Atlas (Mongoose ODM)        ║
║  AI / LLM        ║  Google Gemini 1.5 Flash             ║
║  Auth            ║  JWT + bcryptjs                      ║
║  Deployment      ║  Docker (multi-stage build)          ║
╚══════════════════╩══════════════════════════════════════╝
```

<br/>

---

<br/>

## 🚀 &nbsp;Quick Start

You need **Node.js 20+** and **npm** installed.

```bash
# 1. Clone the repo
git clone https://github.com/Matheeshkumar368/Employee-Feedback-Agent.git
cd Employee-Feedback-Agent

# 2. Install packages
npm install

# 3. Copy environment file and fill in your values
cp .env.example .env.local

# 4. Start the app
npm run dev
```

Open **http://localhost:3000** in your browser.

<br/>

### 🔑 &nbsp;Environment Variables

Open `.env.local` and fill in these values:

| Variable | What to put |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any long random string (32+ characters) |
| `GEMINI_API_KEY` | Your Google Gemini API key |
| `NEXTAUTH_SECRET` | Another long random string |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |

**Get a free Gemini API key:** [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)  
**Get a free MongoDB Atlas cluster:** [mongodb.com/atlas](https://www.mongodb.com/atlas)

<br/>

### 🌱 &nbsp;Seed Demo Data

Once the app is running, load sample users and feedback:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "aurahr-seed-2024"}'
```

**Demo accounts created:**
- Admin → `admin@aurahr.com` / `admin123`
- Employee → `john.doe@aurahr.com` / `employee123`

<br/>

---

<br/>

## 🐳 &nbsp;Deploy with Docker

No Node.js installation needed on the server — Docker handles everything.

```bash
# Build the image
docker build -t employee-feedback-agent .

# Run it
docker run -p 3000:3000 \
  -e MONGODB_URI="your_atlas_uri" \
  -e JWT_SECRET="your_secret" \
  -e GEMINI_API_KEY="your_gemini_key" \
  -e NEXTAUTH_SECRET="your_secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  employee-feedback-agent
```

Or use Docker Compose (starts the app + a local MongoDB together):

```bash
cp .env.example .env.local   # fill in your keys
docker compose up --build
```

<br/>

---

<br/>

## 📁 &nbsp;Project Structure

```
📦 Employee-Feedback-Agent
 ┣ 📂 src/
 ┃  ┣ 📂 app/               ← All pages (Next.js App Router)
 ┃  ┃  ┣ 📂 admin/          ← Admin dashboard, analytics, AI chat
 ┃  ┃  ┣ 📂 employee/       ← Employee dashboard, submit feedback
 ┃  ┃  ┗ 📂 api/            ← Backend API routes
 ┃  ┣ 📂 components/        ← Reusable UI components
 ┃  ┣ 📂 lib/               ← AI (Gemini), database, auth helpers
 ┃  ┗ 📂 models/            ← MongoDB data schemas
 ┣ 📜 Dockerfile            ← Production Docker build
 ┣ 📜 docker-compose.yml    ← App + MongoDB together
 ┗ 📜 .env.example          ← Template for environment variables
```

<br/>

---

<br/>

## 🔭 &nbsp;What's Next

| Feature | Status |
|---|---|
| Email alerts when urgent feedback arrives | 🔜 Planned |
| PDF report export | 🔜 Planned |
| Real-time notifications | 🔜 Planned |
| Employee profile editing | 🔜 Planned |
| Mobile-friendly improvements | 🔜 Planned |

<br/>

---

<br/>

<div align="center">

```
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   Built with  ❤️  for college project    ║
  ║   by  Matheesh Kumar                     ║
  ║                                          ║
  ║   Google Gemini  ×  MongoDB  ×  Docker   ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
```

[![MIT License](https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge)](LICENSE)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

</div>
