import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// ── Controllers ───────────────────────────────────────────────────────────────
import taskRouter   from './controller/taskControllers.js';
import logRouter    from './controller/logController.js';
import searchRouter from './controller/searchController.js';

// ── Database ──────────────────────────────────────────────────────────────────
import { connectDB } from './config/db.js';

dotenv.config(); // Read environment variables (.env) — must be before PORT use

const app = express();
app.use(express.json({ limit: '10mb' })); // Allow large payloads (embeddings)

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow requests from:
//  - FastAPI Gateway (8000)
//  - React Frontend (5173)
app.use(cors({
  origin: [
    "http://localhost:8000",  // FastAPI Gateway
    "http://localhost:5173",  // Vite / React Frontend
    "http://localhost:3000",  // Fallback
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "token", "authorization"],
}));

// ── MongoDB Connection ────────────────────────────────────────────────────────
connectDB();

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/task",   taskRouter);   // Original task management (kept from template)
app.use("/logs",   logRouter);    // MongoDB activity logs
app.use("/search", searchRouter); // Vector / semantic search + book content

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", async (req, res) => {
  res.json({
    code: 200,
    service: "Digital Library – Node.js / MongoDB Service",
    port: process.env.PORT,
    endpoints: {
      tasks:  "POST /task/createtask | GET /task/getalltasks/:PAGE/:SIZE | DELETE /task/deletetask/:ID",
      logs:   "POST /logs | GET /logs | GET /logs/recent | GET /logs/stats | GET /logs/user/:userId",
      search: "GET /search?q=<query>&topK=5 | POST /search/content | GET /search/content/:bookId | DELETE /search/content/:bookId",
    },
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  console.log(`✅  Node.js / MongoDB service running on http://localhost:${PORT}`);
});