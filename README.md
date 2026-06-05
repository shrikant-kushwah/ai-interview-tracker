# Interview Tracker

Interview Tracker is a full stack SaaS style project built to manage the job search workflow end to end. It combines application tracking, interview round management, dashboard analytics, and AI powered features in a single product. From a technical side, the project includes JWT based authentication, protected CRUD APIs, file upload and PDF parsing, provider based AI integration with OpenAI and Gemini, and streaming responses for chat and generation features.

## Live Demo

Frontend: https://ai-intreview-tracker.vercel.app

Backend: https://ai-intreview-tracker.onrender.com

## What the app does

The core app covers the day to day parts of a job search.

1. Register, login, logout, and session handling with JWT in HTTP only cookies
2. Create, update, delete, and view job applications
3. Track statuses like applied, screening, interview, offer, rejected, and ghosted
4. Add interview rounds with date, notes, and outcome
5. View dashboard stats and application breakdowns
6. Search and filter applications

On top of that, I added AI features that use the application context.

1. Generate a cold email for a recruiter
2. Generate a follow up email
3. Generate likely interview questions from the job description
4. Upload a resume PDF and get feedback against the job description
5. Use a streaming AI assistant for interview prep, salary negotiation, and general career questions

## Tech stack

### Frontend

1. Next.js with App Router
2. TypeScript
3. Tailwind CSS
4. shadcn/ui
5. Zustand
6. React Hook Form
7. Zod
8. Recharts
9. React Markdown

### Backend

1. Node.js
2. Express
3. MongoDB
4. Mongoose
5. JWT authentication
6. Multer
7. pdf-parse

### AI

1. OpenAI
2. Gemini
3. Server Sent Events for streaming responses

## Project structure

```text
interview-tracker/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
    server.js

  frontend/
    src/
      app/
      components/
      services/
      store/
      types/
```

## Getting started

### 1. Clone the project

```bash
git clone https://github.com/codeasj/interview-tracker.git
cd interview-tracker
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000

AI_PROVIDER=gemini

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-lite

OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the app

```text
http://localhost:3000
```

## API routes

### Auth

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Applications

```text
GET    /api/applications
POST   /api/applications
GET    /api/applications/stats
GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id
POST   /api/applications/:id/interviews
```

### AI

```text
POST   /api/ai/cold-email
POST   /api/ai/followup
POST   /api/ai/questions
POST   /api/ai/resume-feedback
POST   /api/ai/chat
```

## A few implementation details I liked

I kept the AI layer provider based, so I can switch between Gemini and OpenAI through environment variables without changing application code. I also used streaming responses for the AI assistant and the email and question generators so the UI feels more responsive while text is being generated. For chat, I used a small sliding context window so only recent messages are sent to the model, which helps keep token usage and response cost under control.

For auth, I used JWT with HTTP only cookies instead of storing tokens in localStorage. For data access, queries are scoped by `userId` so one user cannot read or update another user’s applications.

For resume feedback, PDFs are uploaded in memory and parsed into text before being sent to the model. That keeps the feature simple without adding file storage.

## Author

Shrikant Kushwah  
GitHub: [@shrikant-kushwah](https://github.com/shrikant-kushwah)  
LinkedIn: [shrikant-kushwah](https://linkedin.com/in/shrikant-kushwah)
