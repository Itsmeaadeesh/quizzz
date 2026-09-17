# StayAheadd 🎓✨

> **Turn your study notes into instant quizzes with AI.**  
> Upload PDFs, PowerPoint slides, Word documents, or pasted notes and test yourself in seconds.

---

## 🎨 Brand & Theme

- **Name**: StayAheadd
- **Color Palette**:
  - **Primary Blue**: `#22C3F4` / `#29B6E8` (Dark: `#1C8FBF`, Light: `#EBF9FE`)
  - **Accent Orange**: `#FAA722` / `#F5A623` (Light: `#FEF6E9`)
  - **Ink Text**: `#14181F`
  - **Muted Grey**: `#5B6472`
  - **Background**: Clean white `#FFFFFF` with subtle light-blue dotted pattern
  - **Hairline Borders**: `#E7ECF1`
- **Visual Style**:
  - Pill-shaped (fully rounded) buttons in blue with white text
  - Soft rounded cards (16–20px radius) with light borders and subtle shadow on hover
  - Clean sans-serif typography (Poppins & Inter)
  - Sentence case formatting everywhere (no all-caps labels)
- **Wordmark**: Pixel-faithful brand mark with dark ink "STAY", vibrant cyan "AHEAD" (featuring the integrated cursor/plane notch), and overlapping orange "D".

---

## 🚀 Key Features

1. **Multi-Format Document Ingestion**:
   - **PDF**: Full text extraction using `pdf-parse`
   - **DOCX**: Clean paragraph & table parsing via `mammoth`
   - **PPTX**: Slide-by-slide text extraction with `officeparser`
   - **Plain Text / Paste**: Direct paste with instant word count
   - **File Size Validation**: Strict 10MB limit with friendly, in-voice error feedback:
     > *"Whoa, that file is over 10MB! Please upload a file under 10MB or paste your notes directly."*

2. **Customizable Quiz Configuration**:
   - **Question Types**: Multiple Choice (MCQ), True/False, Short Answer, or Mixed
   - **Question Count**: 10, 20, 30, or custom range slider (5 to 40)
   - **Target Difficulty**: Easy, Medium, or Hard

3. **Gemini 2.0 Flash Generation**:
   - Server-side only execution (API key never exposed to client)
   - Structured JSON response (`response_mime_type: "application/json"`)
   - Schema enforcement with automatic single-retry self-healing
   - Per-IP rate limiting to protect API quotas

4. **Interactive Quiz Experience**:
   - One question at a time focus mode
   - Instant color-coded feedback (emerald for correct, soft red for incorrect)
   - Detailed concept explanations and takeaways revealed on wrong answers
   - Short answer semantic matching

5. **Performance Analytics & Dashboard**:
   - Score breakdown and accuracy percentage
   - Filterable question review (All, Correct, Incorrect)
   - Persistent study history across sessions (Supabase PostgreSQL + LocalStorage cache)
   - Guest Mode: Instant zero-friction test drive without requiring account setup

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Canvas Confetti
- **Backend**: Node.js, Express, TypeScript, Multer, `pdf-parse`, `mammoth`, `officeparser`
- **AI Engine**: Google Gemini API (`gemini-2.0-flash`) with structured JSON schema
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Deployment**: Frontend on Vercel, Backend on Render / Railway

---

## 📁 Repository Structure

```
stayaheadd/
├── assets/                     # Extracted logo and favicon assets
│   ├── stayaheadd-logo-light.png
│   ├── stayaheadd-logo-dark.png
│   ├── favicon.png
│   └── icon-192.png
├── client/                     # Vite + React + TypeScript + TailwindCSS
│   ├── public/
│   │   ├── stayaheadd-logo-light.png
│   │   ├── stayaheadd-logo-dark.png
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Logo
│   │   ├── context/            # AuthContext (Supabase + Guest)
│   │   ├── pages/              # Landing, Upload, Quiz, Results, Dashboard, Auth
│   │   ├── services/           # API client & Supabase client
│   │   ├── index.css           # Tailwind tokens, dotted background & pill utilities
│   │   └── types.ts            # Quiz & Question TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Express + TypeScript + File Parsers + Gemini API
│   ├── src/
│   │   ├── routes/             # /api/quiz (extract, generate, attempt, history)
│   │   ├── services/           # Extractor, Gemini 2.0 Flash, Supabase
│   │   ├── index.ts            # Server entrypoint & rate limiting
│   │   └── types.ts
│   ├── schema.sql              # Supabase PostgreSQL schema & RLS policies
│   ├── package.json
│   └── tsconfig.json
├── .env.example                # Environment variables template
├── .gitignore
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Monorepo orchestration
└── README.md
```

---

## ⚙️ Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Itsmeaadeesh/quizzz.git
cd quizzz
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root (or configure both `client` and `server`):
```bash
cp .env.example .env
```

Fill in your API credentials:
```env
# Google Gemini API Key (Server-side only)
# Get a free key at https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
# Found at https://supabase.com/dashboard
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key

# Frontend Environment Variables
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
VITE_API_URL=http://localhost:5000
```

> **Note**: If you don't configure keys right away, StayAheadd will automatically run with its built-in intelligent offline fallback generator and guest session mode!

### 3. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
npm install --prefix server
npm install --prefix client
```

### 4. Run the Development Server
```bash
# Run both client and backend concurrently
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

---

## 🗄️ Database Setup (Supabase)

To enable persistent cloud sync:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab.
3. Paste and run the contents of [`server/schema.sql`](./server/schema.sql).
4. Copy your **Project URL** and **anon public key** into your `.env` file.

---

## 🚀 Deployment

### Deploying Frontend to Vercel
The project includes `vercel.json` configured for Vite SPA routing:
```bash
npx vercel --prod
```
Configure the following environment variables in your Vercel Project Settings:
- `VITE_API_URL`: URL of your deployed backend (e.g. on Render/Railway)
- `VITE_SUPABASE_URL`: Your Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key

### Deploying Backend to Render / Railway
1. Set the build command: `npm install && npm run build`
2. Set the start command: `npm start`
3. Add `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` to environment variables.

---

## 📄 License
MIT License © StayAheadd