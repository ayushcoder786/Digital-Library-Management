import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.init import *

app = FastAPI(title="Digital Library – API Gateway", version="1.0.0")

# Allow local frontend origins by default (also include any FRONTEND_URL envs)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]
frontend_env = os.getenv("FRONTEND_URL", "")
if frontend_env:
    origins.extend([url.strip() for url in frontend_env.split(",") if url.strip()])

# Always allow credentials for local development so cookies / tokens work
allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Spring Boot Routes (SQL / relational data) ────────────────────────────────
app.include_router(AuthenticationRouter)
app.include_router(BookRouter)
app.include_router(UserRouter)
app.include_router(BorrowRouter)
app.include_router(CategoryRouter)

# ── Node.js / MongoDB Routes (NoSQL / unstructured data) ─────────────────────
app.include_router(LogRouter)       # Activity logs  → /api/logs
app.include_router(SearchRouter)    # Vector search  → /api/search
app.include_router(MongoUserRouter) # MongoDB users  → /api/mongo/users

@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Digital Library API Gateway – FastAPI on :8000",
        "spring_boot_routes": ["/api/auth", "/api/books", "/api/users", "/api/borrows", "/api/categories"],
        "nodejs_routes":      ["/api/logs", "/api/search"],
    }
