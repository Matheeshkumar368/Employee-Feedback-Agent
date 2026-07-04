<div align="center">

# 🌟 AuraHR

### AI-Powered Employee Feedback & HR Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/atlas)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_1.5_Flash-orange?logo=google)](https://ai.google.dev)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> A full-stack HR platform that collects employee feedback, analyzes it using Google Gemini AI, and surfaces actionable insights to HR administrators — all in a premium, glassmorphism-styled UI.

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technology Stack](#-technology-stack)
4. [AI Agent Workflow](#-ai-agent-workflow)
5. [Prompt Engineering](#-prompt-engineering)
6. [System Architecture](#-system-architecture)
7. [Folder Structure](#-folder-structure)
8. [Installation](#-installation)
9. [Environment Variables](#-environment-variables)
10. [MongoDB Setup](#-mongodb-setup)
11. [Gemini API Setup](#-gemini-api-setup)
12. [Running Locally](#-running-locally)
13. [Docker Deployment](#-docker-deployment)
14. [Vercel Deployment](#-vercel-deployment)
15. [Troubleshooting](#-troubleshooting)
16. [Future Scope](#-future-scope)
17. [Credits](#-credits)

---

## 🧭 Project Overview

**AuraHR** is a college-level full-stack capstone project that demonstrates the integration of:

- **Modern web development** (Next.js 15 App Router, TypeScript, Tailwind CSS v4)
- **NoSQL database design** (MongoDB Atlas with Mongoose ODM)
- **Generative AI integration** (Google Gemini 1.5 Flash for NLP analysis)
- **Secure authentication** (JWT + bcrypt, role-based access control)
- **Data visualization** (Recharts analytics dashboard with 7 chart types)
- **Production DevOps** (Docker multi-stage builds, Vercel deployment)

The platform serves two user roles:
- **Employees** submit structured feedback and instantly receive AI-analyzed results
- **HR Administrators** manage feedback, view analytics, chat with an AI agent, and generate AI-powered reports

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based stateless authentication with `bcryptjs` password hashing
- Dual token storage (httpOnly cookie + localStorage) for resilient auth
- Role-based access control (`admin` / `employee`) enforced at middleware level
- Automatic redirect on expired tokens
- Input validation with Zod

### 📝 Feedback Module
- Structured feedback form: rating (1–5 stars), category, department, message
- Anonymous submission option
- Character counter with 500-char limit
- Post-submit AI analysis with polling animation
- Full feedback history with search, filter, sort, and pagination
- Inline status management for admins (pending → reviewed → resolved)
- Detail modal with AI analysis panel

### 🤖 AI Agent (Gemini 1.5 Flash)
- Automatic sentiment analysis on every feedback submission
- Classifies: sentiment, priority, urgency, emotion, keywords
- Generates HR and management recommendations
- Interactive AI chat for HR admins with live database context injection
- Persisted chat sessions in MongoDB
- AI Insights report with 7-day / 30-day / 90-day time filters

### 📊 Analytics Dashboard
- 10 animated stat cards (total, positive %, avg rating, pending, etc.)
- 7 Recharts visualizations:
  - Monthly trend line chart
  - Satisfaction area chart
  - Sentiment pie chart
  - Category donut chart
  - Department bar chart
  - Priority stacked bar chart
  - Rating distribution histogram
- Department analytics table with sentiment scores and trends
- Keyword frequency word cloud
- AI-generated insights panel
- Filters: department, category, sentiment, priority, date range
- CSV export and print functionality

### 🏢 Administration
- Employee management (list view with stats)
- Department breakdown view
- Full feedback management with 8-column table

### 💎 UI/UX
- Glassmorphism design with aurora gradient background
- Framer Motion animations throughout
- Responsive sidebar with collapse/expand
- Skeleton loaders on all data-fetching screens
- Dark mode support
- Accessible Radix UI primitives

---

## 🛠 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js App Router | 15.3.3 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | MongoDB Atlas + Mongoose | 8.5.x |
| **AI** | Google Gemini 1.5 Flash | @google/generative-ai 0.15 |
| **Auth** | JWT + bcryptjs | jsonwebtoken 9.x |
| **Validation** | Zod | 3.23.x |
| **Charts** | Recharts | 2.12.x |
| **Animation** | Framer Motion | 11.x |
| **UI Primitives** | Radix UI | Various |
| **Icons** | Lucide React | 0.446 |
| **Markdown** | react-markdown + remark-gfm | 9.x / 4.x |
| **Container** | Docker (Alpine Node 20) | — |
| **Deployment** | Vercel / Docker | — |

---

## 🤖 AI Agent Workflow

```
Employee submits feedback
        │
        ▼
POST /api/feedback
  → Save to MongoDB (status: pending)
  → Return feedback ID
        │
        ▼
POST /api/ai/analyze
  → Retrieve feedback from MongoDB
  → Build structured prompt (department + category + rating + message)
  → Send to Gemini 1.5 Flash
  → Parse JSON response
  → Validate all fields with fallback defaults
  → Update MongoDB feedback document with AIAnalysis subdocument
        │
        ▼
Employee polls for AI result (up to 5 × 3s)
        │
        ▼
Admin dashboard shows AI-enriched feedback
        │
        ▼
Admin uses AI Chat → POST /api/chat
  → Load conversation history from MongoDB
  → Aggregate live feedback statistics from DB
  → Inject context into Gemini system prompt
  → Stream AI response
  → Save turn to ChatHistory model
        │
        ▼
Admin views AI Insights → GET /api/ai/report
  → MongoDB aggregation pipeline (sentiment, priority, urgency, keywords)
  → Pass aggregated data to Gemini generateInsights()
  → Return 5 structured insights + full report data
```

---

## 🧪 Prompt Engineering

AuraHR uses a **layered prompt engineering approach**:

### 1. Role Assignment
The system prompt establishes Gemini as a "Senior HR Consultant AI with 20+ years of experience" — this grounds all responses in HR domain knowledge.

### 2. Few-Shot Examples
Three complete input→output examples are prepended to every analysis prompt:
- One negative feedback example (micromanagement, priority: high)
- One positive feedback example (remote work, priority: low)
- One neutral feedback example (career growth, priority: medium)

This dramatically improves JSON consistency and output quality.

### 3. Structured Output Constraints
The prompt explicitly defines the exact JSON schema and uses pipe-separated enum values (`"positive" | "neutral" | "negative"`) to constrain the model's choices.

### 4. Temperature Tuning
- `analyzeFeedback`: temperature `0.2` — deterministic, consistent classification
- `chatWithAgent`: temperature `0.7` — conversational, natural responses
- `generateInsights`: temperature `0.4` — balanced creativity with factual grounding

### 5. Context Injection for Chat
Before every chat turn, live feedback statistics are aggregated from MongoDB and injected into the system prompt — enabling the AI to answer questions like "Which department has the most negative feedback this month?" with real data.

### 6. Graceful Fallbacks
Every Gemini call is wrapped in try/catch with deterministic fallback logic based on the numeric rating — ensuring the app never breaks even if the API is down or rate-limited.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  React 18 · Framer Motion · Recharts · Radix UI             │
│  AuthContext (JWT) · localStorage · httpOnly cookie          │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP / REST
┌───────────────────────▼─────────────────────────────────────┐
│                  Next.js 15 App Router                       │
│                                                              │
│  Edge Middleware (JWT verification, role-based redirects)    │
│                                                              │
│  App Routes (Server Components + Client Components)          │
│  ├── /login/{admin,employee}                                 │
│  ├── /admin/{dashboard,feedback,analytics,ai-chat,...}       │
│  └── /employee/{dashboard,feedback,ai-history,...}           │
│                                                              │
│  API Routes (Route Handlers — Node.js runtime)               │
│  ├── /api/login        /api/register   /api/profile          │
│  ├── /api/feedback     /api/feedback/[id]                    │
│  ├── /api/analytics    /api/dashboard/{admin,employee}       │
│  ├── /api/chat         /api/ai/{analyze,history,report}      │
│  └── /api/seed                                               │
└──────────────┬────────────────────────┬─────────────────────┘
               │                        │
┌──────────────▼──────────┐  ┌──────────▼──────────────────┐
│     MongoDB Atlas        │  │   Google Gemini 1.5 Flash   │
│                         │  │                             │
│  Collections:           │  │  analyzeFeedback()          │
│  ├── users              │  │  chatWithAgent()            │
│  ├── feedbacks          │  │  generateInsights()         │
│  └── chathistories      │  │                             │
│                         │  │  Model: gemini-1.5-flash    │
│  Mongoose ODM           │  │  SDK: @google/generative-ai │
└─────────────────────────┘  └─────────────────────────────┘
```

---

## 📁 Folder Structure

```
aurahr/
├── public/                        # Static assets
│   └── *.svg                      # SVG icons
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (AuthProvider + Toaster)
│   │   ├── page.tsx               # Landing page
│   │   ├── globals.css            # Global styles + custom CSS classes
│   │   ├── login/
│   │   │   ├── admin/page.tsx     # Admin login
│   │   │   └── employee/page.tsx  # Employee login
│   │   ├── admin/
│   │   │   ├── dashboard/         # Admin home + stats
│   │   │   ├── feedback/          # Feedback management table
│   │   │   ├── analytics/         # Full analytics dashboard
│   │   │   ├── ai-chat/           # AI chat interface
│   │   │   ├── ai-insights/       # AI report page
│   │   │   ├── employees/         # Employee directory
│   │   │   ├── departments/       # Department breakdown
│   │   │   ├── reports/           # Reports (coming soon)
│   │   │   └── settings/          # Settings (coming soon)
│   │   ├── employee/
│   │   │   ├── dashboard/         # Employee home
│   │   │   ├── feedback/submit/   # Feedback submission form
│   │   │   ├── feedback/history/  # Feedback history
│   │   │   ├── ai-history/        # AI-analyzed feedback view
│   │   │   ├── notifications/     # Notifications
│   │   │   ├── profile/           # User profile
│   │   │   └── settings/          # Account settings
│   │   └── api/                   # REST API route handlers
│   │       ├── login/             # POST (login), DELETE (logout)
│   │       ├── register/          # POST
│   │       ├── profile/           # GET, PATCH
│   │       ├── feedback/          # GET (list), POST (create)
│   │       ├── feedback/[id]/     # GET, PATCH, DELETE
│   │       ├── analytics/         # GET (aggregated stats)
│   │       ├── dashboard/admin/   # GET
│   │       ├── dashboard/employee/# GET
│   │       ├── chat/              # POST (send), GET (history), DELETE
│   │       ├── ai/analyze/        # POST (run AI on feedback)
│   │       ├── ai/history/        # GET (employee's AI-analyzed feedback)
│   │       ├── ai/report/         # GET (admin AI insights report)
│   │       └── seed/              # POST (dev only — seed demo data)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardLayout.tsx# Sidebar + topbar shell
│   │   │   ├── Sidebar.tsx        # Animated collapsible sidebar
│   │   │   ├── Topbar.tsx         # Search, notifications, avatar
│   │   │   └── StatCard.tsx       # Animated stat card component
│   │   └── ui/                    # Radix UI wrappers (shadcn-style)
│   │       ├── badge.tsx, button.tsx, card.tsx, input.tsx, label.tsx
│   │       ├── select.tsx, switch.tsx, tabs.tsx, textarea.tsx
│   │       └── toast.tsx, toaster.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx        # Global auth state + JWT helpers
│   ├── hooks/
│   │   └── use-toast.ts           # Toast notification hook
│   ├── lib/
│   │   ├── auth.ts                # JWT sign/verify/authenticateRequest
│   │   ├── gemini.ts              # Gemini AI integration (3 functions)
│   │   ├── mongodb.ts             # Cached Mongoose connection
│   │   └── utils.ts               # cn(), formatDate(), constants
│   ├── middleware.ts               # Edge middleware (auth + RBAC)
│   └── models/
│       ├── User.ts                # Mongoose User schema
│       ├── Feedback.ts            # Mongoose Feedback + AIAnalysis schema
│       └── ChatHistory.ts         # Mongoose ChatHistory schema
├── .dockerignore
├── .env.example                   # Environment variable template
├── .gitignore
├── docker-compose.yml
├── Dockerfile                     # Multi-stage production build
├── eslint.config.mjs
├── LICENSE
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── README.md
```

---

## 🚀 Installation

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20 LTS | [nodejs.org](https://nodejs.org) |
| npm | 10.x | Bundled with Node |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| Docker | 24+ | Optional, for containerized run |

### Clone & Install

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/aurahr.git
cd aurahr

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your real values (see Environment Variables section)

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | Secret for signing JWTs (min 32 chars) |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key |
| `NEXTAUTH_SECRET` | ✅ Yes | NextAuth/session secret (min 32 chars) |
| `NEXTAUTH_URL` | ✅ Yes | App base URL (no trailing slash) |
| `NODE_ENV` | ⬜ Optional | `development` or `production` |

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Run this twice — once for `JWT_SECRET`, once for `NEXTAUTH_SECRET`.

---

## 🍃 MongoDB Setup

### Option A: MongoDB Atlas (Recommended for Production)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account
2. Create a new **Free Tier (M0)** cluster
3. Under **Database Access**, create a user with **Read and Write** permissions
4. Under **Network Access**, add your IP address (or `0.0.0.0/0` for Docker/Vercel)
5. Click **Connect → Connect your application** and copy the connection string
6. Replace `<username>` and `<password>` in the string and set it as `MONGODB_URI`

Your URI format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/aurahr?retryWrites=true&w=majority
```

### Option B: Local MongoDB with Docker

```bash
# Start MongoDB locally (no separate installation needed)
docker run -d \
  --name aurahr_mongo \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=aurahr \
  mongo:7.0
```

Set in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/aurahr
```

### Seed Demo Data

After starting the app, seed the database with sample users and feedback:

```bash
curl -X POST http://localhost:3000/api/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "aurahr-seed-2024"}'
```

This creates:
- **Admin account**: `admin@aurahr.com` / `admin123`
- **Employee accounts**: `john.doe@aurahr.com` / `employee123` (and several others)
- ~50 sample feedback entries with AI analysis

---

## 🧠 Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key and set it as `GEMINI_API_KEY` in `.env.local`

The free tier includes:
- 15 requests/minute
- 1 million tokens/minute
- 1,500 requests/day

> **Note:** AI features gracefully degrade — the app remains fully functional even if the Gemini API is unavailable or rate-limited. All AI calls have deterministic fallback logic.

---

## 💻 Running Locally

```bash
# Development server (with hot reload)
npm run dev

# Production build (verify no errors before deploying)
npm run build

# Production server (after build)
npm run start

# Lint
npm run lint
```

---

## 🐳 Docker Deployment

### Quick Start

```bash
# 1. Build the Docker image
docker build -t aurahr .

# 2. Run with environment variables
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_atlas_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  -e GEMINI_API_KEY="your_gemini_key" \
  -e NEXTAUTH_SECRET="your_nextauth_secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  aurahr
```

App is available at [http://localhost:3000](http://localhost:3000)

### Docker Compose (App + Local MongoDB)

```bash
# Create .env.local with JWT_SECRET, GEMINI_API_KEY, NEXTAUTH_SECRET
cp .env.example .env.local
# Edit .env.local

# Build and start all services
docker compose up --build

# Run in background
docker compose up --build -d

# Stop all services
docker compose down

# Stop and remove volumes (wipes MongoDB data)
docker compose down -v
```

### Production Docker Build

For production with MongoDB Atlas:

```bash
docker build -t aurahr:latest .

docker run -d \
  --name aurahr_prod \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  aurahr:latest
```

### Image Details

| Stage | Base | Purpose |
|-------|------|---------|
| `deps` | node:20-alpine | Install npm dependencies |
| `builder` | node:20-alpine | Build Next.js standalone output |
| `runner` | node:20-alpine | Minimal production runtime |

Final image size: ~120 MB (vs. ~1.2 GB without multi-stage build)

---

## ▲ Vercel Deployment

Vercel is the recommended deployment target for Next.js applications.

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "feat: initial production release"
git remote add origin https://github.com/yourusername/aurahr.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no build config needed

### Step 3: Add Environment Variables

In the Vercel project settings under **Environment Variables**, add:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Your JWT secret (32+ chars) |
| `GEMINI_API_KEY` | Your Gemini API key |
| `NEXTAUTH_SECRET` | Your NextAuth secret (32+ chars) |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` |

### Step 4: Deploy

Click **Deploy**. Vercel will:
- Install dependencies
- Run `npm run build`
- Deploy to a global CDN
- Provide a live URL

> **Important:** Update `NEXTAUTH_URL` to your actual Vercel URL after first deployment.

---

## 🔧 Troubleshooting

### Build Fails: "MONGODB_URI is not defined"
```bash
# Ensure .env.local exists and has MONGODB_URI set
cat .env.local | grep MONGODB_URI
```
The `mongodb.ts` module throws at import time if `MONGODB_URI` is undefined.
For Docker builds, the URI is NOT needed at build time — it's injected at runtime.

### Docker Build: Standalone Output Not Found
```bash
# Ensure DOCKER_BUILD=1 is set during the build stage
# This is already set in the Dockerfile — no action needed
```
The `next.config.ts` enables `output: "standalone"` only when `DOCKER_BUILD=1`.

### Gemini API: "GEMINI_API_KEY is not configured"
- Verify the key is set in `.env.local`
- Ensure no extra spaces or quotes around the value
- Test the key at [Google AI Studio](https://makersuite.google.com)

### MongoDB Connection Timeout
- Check your Atlas cluster is not paused (free tier auto-pauses after 60 days)
- Verify your IP is whitelisted in Atlas Network Access
- Test the connection string with `mongosh "your_connection_string"`

### Port 3000 Already in Use
```bash
# Find and kill the process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

### ESLint Warning During Build
The warning `ESLint: Invalid Options: Unknown options: useEslintrc, extensions` is a cosmetic warning from the ESLint v9 migration — it does not affect the build output or runtime behavior.

---

## 🔭 Future Scope

| Feature | Priority | Description |
|---------|----------|-------------|
| Real-time notifications | High | WebSocket/SSE push notifications for new feedback |
| Email notifications | High | Nodemailer integration for feedback alerts |
| Employee profile editing | Medium | Wire up existing `PATCH /api/profile` to UI |
| Full employee CRUD | Medium | Add/edit/deactivate employees in admin panel |
| Reports generation | Medium | PDF export of analytics with pdfkit |
| Dark mode persistence | Low | Connect `next-themes` to the UI toggle |
| Feedback templates | Low | Predefined feedback prompts by category |
| Multi-language support | Low | i18n with next-intl |
| Rate limiting | High | Upstash Redis rate limiting on API routes |
| Audit log | Medium | Track all admin actions with timestamps |
| Mobile app | Low | React Native companion app |

---

## 🙏 Credits

| Contribution | Source |
|-------------|--------|
| Framework | [Next.js](https://nextjs.org) by Vercel |
| AI Model | [Google Gemini](https://deepmind.google/technologies/gemini/) by Google DeepMind |
| UI Primitives | [Radix UI](https://radix-ui.com) |
| Charts | [Recharts](https://recharts.org) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide](https://lucide.dev) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |

---

<div align="center">

Built with ❤️ for college submission · MIT License

</div>
