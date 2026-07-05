<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6C63FF,50:A855F7,100:EC4899&height=200&section=header&text=Employee%20Feedback%20Platform&fontSize=38&fontColor=ffffff&fontAlignY=38&desc=AI-Powered%20%7C%20Smart%20Analysis%20%7C%20Real%20Insights&descAlignY=58&descSize=16&animation=fadeIn" width="100%"/>

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=22&pause=1000&color=A855F7&center=true&vCenter=true&width=600&lines=Where+Employee+Voice+Meets+AI+Intelligence;Every+Feedback+Analyzed+Automatically;Smarter+HR+Decisions+Start+Here" alt="Typing SVG" />

<br/><br/>

[![Next.js](https://img.shields.io/badge/Next.js%2015-0f0f0f?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)&nbsp;
[![TypeScript](https://img.shields.io/badge/TypeScript-1e3a5f?style=for-the-badge&logo=typescript&logoColor=61DAFB)](https://www.typescriptlang.org)&nbsp;
[![MongoDB](https://img.shields.io/badge/MongoDB-0f2d1e?style=for-the-badge&logo=mongodb&logoColor=47A248)](https://www.mongodb.com/atlas)&nbsp;
[![Gemini AI](https://img.shields.io/badge/Gemini%201.5%20Flash-1a1a2e?style=for-the-badge&logo=google&logoColor=4285F4)](https://ai.google.dev)&nbsp;
[![Docker](https://img.shields.io/badge/Docker-0d1b2a?style=for-the-badge&logo=docker&logoColor=2496ED)](https://www.docker.com)&nbsp;
[![MIT License](https://img.shields.io/badge/License-MIT-2d1b4e?style=for-the-badge&logoColor=F7DF1E)](LICENSE)

<br/>

</div>

---

<div align="center">

## 💬 &nbsp; What Is This?

</div>

**Employee Feedback Platform** is a web application where employees share their thoughts about work — and an AI agent reads every single message, understands the feeling behind it, and shows HR managers a clear picture of what's happening inside the company.

No more unread feedback. No more guessing. Just clear, AI-powered answers.

<br/>

<div align="center">

```
                    ╭──────────────────────────────────╮
                    │                                  │
                    │   👤  Employee writes feedback   │
                    │            │                     │
                    │            ▼                     │
                    │   🤖  AI reads & understands     │
                    │            │                     │
                    │            ▼                     │
                    │   📊  HR sees clear insights     │
                    │                                  │
                    ╰──────────────────────────────────╯
```

</div>

<br/>

---

<div align="center">

## ✅ &nbsp; College Requirements — All Met

</div>

<br/>

<div align="center">

| # | Requirement | Solution Used |
|:-:|---|---|
| 1 | ✅ Unique individual project | AI-driven employee feedback — original topic |
| 2 | ✅ Prompt Engineering | Role prompts · Few-shot examples · Temperature tuning |
| 3 | ✅ LLM API | Google Gemini 1.5 Flash |
| 4 | ✅ Database | MongoDB Atlas (cloud database) |
| 5 | ✅ Web Framework | Next.js 15 (React) |
| 6 | ✅ Frontend | TypeScript + Tailwind CSS + Framer Motion |
| 7 | ✅ Deployment | Docker (multi-stage containerized build) |

</div>

<br/>

---

<div align="center">

## 👥 &nbsp; Two Types of Users

</div>

<br/>

<div align="center">

```
 ┌──────────────────────────────┐       ┌──────────────────────────────┐
 │                              │       │                              │
 │   👤   E M P L O Y E E      │       │   🛡️   H R   A D M I N      │
 │                              │       │                              │
 │  • Submit feedback           │       │  • View all feedback         │
 │  • Choose mood & category    │       │  • See AI analysis           │
 │  • Stay anonymous if needed  │       │  • Chat with AI agent        │
 │  • See AI reply on your post │       │  • Read auto-generated       │
 │  • View your history         │       │    reports & charts          │
 │                              │       │  • Manage employees          │
 └──────────────────────────────┘       └──────────────────────────────┘
```

</div>

<br/>

---

<div align="center">

## ✨ &nbsp; Features at a Glance

</div>

<br/>

> **🔐 Secure Login**  
> Employees and admins have separate portals. Passwords are never stored as plain text. Sessions are protected with JWT tokens.

> **📝 Feedback Form**  
> Pick a star rating (1–5), choose a department and category, type your message, and hit submit. That's it — the AI takes over from there.

> **🤖 Instant AI Analysis**  
> Every feedback is automatically analyzed by Google Gemini. Within seconds you get: mood, urgency, emotion, keywords, and a recommendation for HR.

> **💬 AI Chat for HR**  
> Admins can ask the AI questions like *"Which team is struggling the most?"* and get real answers — because the AI reads live data from the database before replying.

> **📊 Analytics Dashboard**  
> 7 interactive charts showing trends, sentiment over time, department scores, category breakdowns, and more. Filter by date, department, or priority.

> **📄 Auto-Generated Reports**  
> One click generates a full written report summarizing the last 7, 30, or 90 days of feedback — written by the AI in plain English.

<br/>

---

<div align="center">

## 🤖 &nbsp; How the AI Agent Works

</div>

<br/>

<div align="center">

```
  ════════════════════════════════════════════════════════════════
   STEP 1  │  Employee submits feedback through the web form
  ════════════════════════════════════════════════════════════════
                              │
                              ▼
  ════════════════════════════════════════════════════════════════
   STEP 2  │  Feedback saved to MongoDB Atlas (cloud database)
  ════════════════════════════════════════════════════════════════
                              │
                              ▼
  ════════════════════════════════════════════════════════════════
   STEP 3  │  AI Agent (Gemini 1.5 Flash) reads the feedback
           │
           │   Prompt contains →  department + category
           │                      star rating + message text
           │                      3 example feedback samples
  ════════════════════════════════════════════════════════════════
                              │
                              ▼
  ════════════════════════════════════════════════════════════════
   STEP 4  │  AI returns structured result
           │
           │   • Sentiment    →  positive / neutral / negative
           │   • Priority     →  high / medium / low
           │   • Urgency      →  immediate / normal / low
           │   • Emotion      →  frustrated / happy / anxious...
           │   • Keywords     →  ["workload","team","growth"]
           │   • Suggestion   →  what HR should do about it
  ════════════════════════════════════════════════════════════════
                              │
                              ▼
  ════════════════════════════════════════════════════════════════
   STEP 5  │  Admin sees enriched feedback + charts + AI chat
  ════════════════════════════════════════════════════════════════
```

</div>

<br/>

---

<div align="center">

## 🧠 &nbsp; Prompt Engineering — 6 Techniques Used

</div>

<br/>

<div align="center">

| Technique | Simple Explanation |
|---|---|
| 🎭 **Role Assignment** | We tell the AI: *"You are a Senior HR Consultant with 20 years of experience"* — this makes every answer more relevant and professional |
| 📚 **Few-Shot Examples** | Before the real question, we show the AI 3 example feedbacks with correct answers — so it knows exactly what format to follow |
| 🧱 **Structured Output** | We force the AI to always reply in JSON format — no random text, always clean and consistent |
| 🌡️ **Temperature Control** | Low temperature (0.2) for analysis = precise results. High (0.7) for chat = natural conversation |
| 💉 **Context Injection** | Before every chat reply, live stats from MongoDB are fed into the AI — so it answers based on real current data |
| 🛡️ **Graceful Fallbacks** | If the AI is unavailable, the app uses smart defaults based on star rating — it never crashes |

</div>

<br/>

---

<div align="center">

## 🛠️ &nbsp; Tech Stack

</div>

<br/>

<div align="center">

```
 ╔═══════════════╦══════════════════════════════════════════════╗
 ║  Layer        ║  Technology                                  ║
 ╠═══════════════╬══════════════════════════════════════════════╣
 ║  Language     ║  TypeScript                                  ║
 ║  Framework    ║  Next.js 15  (React full-stack)              ║
 ║  Styling      ║  Tailwind CSS v4                             ║
 ║  UI Parts     ║  Radix UI  +  Lucide Icons                   ║
 ║  Animation    ║  Framer Motion                               ║
 ║  Charts       ║  Recharts (7 chart types)                    ║
 ║  Database     ║  MongoDB Atlas  +  Mongoose                  ║
 ║  AI / LLM     ║  Google Gemini 1.5 Flash                     ║
 ║  Auth         ║  JWT  +  bcryptjs (hashed passwords)         ║
 ║  Deploy       ║  Docker  (multi-stage production build)      ║
 ╚═══════════════╩══════════════════════════════════════════════╝
```

</div>

<br/>

---

<div align="center">

## 🚀 &nbsp; Run It Locally

</div>

<br/>

You need **Node.js 20+** installed. That's it.

```bash
# Step 1 — Clone this project
git clone https://github.com/Matheeshkumar368/Employee-Feedback-Agent.git
cd Employee-Feedback-Agent

# Step 2 — Install all packages
npm install

# Step 3 — Set up your environment keys
cp .env.example .env.local
# Open .env.local and fill in your values (see table below)

# Step 4 — Start the app
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)**

<br/>

### 🔑 &nbsp; Keys You Need

| Key | Where to Get It | What It Does |
|---|---|---|
| `MONGODB_URI` | [mongodb.com/atlas](https://www.mongodb.com/atlas) — free tier | Connects to your database |
| `GEMINI_API_KEY` | [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey) — free | Powers the AI analysis |
| `JWT_SECRET` | Any random 32+ character string | Keeps logins secure |
| `NEXTAUTH_SECRET` | Any random 32+ character string | Session security |
| `NEXTAUTH_URL` | `http://localhost:3000` for local | App base URL |

<br/>

### 🌱 &nbsp; Load Sample Data

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "aurahr-seed-2024"}'
```

This creates ready-to-use demo accounts:

```
Admin    →  admin@aurahr.com      /  admin123
Employee →  john.doe@aurahr.com   /  employee123
```

<br/>

---

<div align="center">

## 🐳 &nbsp; Deploy with Docker

</div>

<br/>

```bash
# Build the container
docker build -t employee-feedback-platform .

# Run it (replace the values in quotes with your real keys)
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_atlas_uri" \
  -e JWT_SECRET="your_secret_here" \
  -e GEMINI_API_KEY="your_gemini_key" \
  -e NEXTAUTH_SECRET="your_secret_here" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  employee-feedback-platform
```

Or start everything with one command using Docker Compose:

```bash
cp .env.example .env.local   # fill in your keys first
docker compose up --build    # starts app + database together
```

<br/>

---

<div align="center">

## 📁 &nbsp; Folder Layout

</div>

<br/>

```
📦 Employee-Feedback-Platform
 │
 ├── 📂 src/
 │    ├── 📂 app/
 │    │    ├── 📂 admin/        ← Admin pages (dashboard, analytics, AI chat)
 │    │    ├── 📂 employee/     ← Employee pages (submit feedback, history)
 │    │    └── 📂 api/          ← All backend logic lives here
 │    │
 │    ├── 📂 components/        ← Buttons, cards, sidebar, charts
 │    ├── 📂 lib/               ← AI setup, database connection, auth
 │    └── 📂 models/            ← Database structure (User, Feedback, Chat)
 │
 ├── 🐳 Dockerfile              ← Builds a production-ready container
 ├── 🐳 docker-compose.yml      ← Runs app + MongoDB together
 └── 📄 .env.example            ← Template — copy and fill with your keys
```

<br/>

---

<div align="center">

## 🔭 &nbsp; Coming Soon

| Feature | When |
|---|---|
| 📧 Email alerts for urgent feedback | Next version |
| 📑 PDF report download | Next version |
| 🔔 Real-time notifications | Next version |
| 📱 Better mobile layout | Next version |
| 🌐 Multi-language support | Future |

</div>

<br/>

---

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:EC4899,50:A855F7,100:6C63FF&height=120&section=footer&animation=fadeIn" width="100%"/>

**Made  by MatheeshKumar S**

* GROKAI &nbsp;×&nbsp; Google Gemini &nbsp;×&nbsp; MongoDB Atlas &nbsp;×&nbsp; Next.js &nbsp;×&nbsp; Docker*

[![MIT License](https://img.shields.io/badge/License-MIT-A855F7?style=flat-square)](LICENSE)&nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-Matheeshkumar368-6C63FF?style=flat-square&logo=github)](https://github.com/Matheeshkumar368)

</div>
