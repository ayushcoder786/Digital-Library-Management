from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.init import *

app = FastAPI(title="Digital Library – API Gateway", version="1.0.0")

origins = [
    "http://localhost:5173",   # React / Vite frontend
    "http://localhost:3000",   # fallback
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
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
app.include_router(LogRouter)     # Activity logs  → /api/logs
app.include_router(SearchRouter)  # Vector search  → /api/search

@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Digital Library API Gateway – FastAPI on :8000",
        "spring_boot_routes": ["/api/auth", "/api/books", "/api/users", "/api/borrows", "/api/categories"],
        "nodejs_routes":      ["/api/logs", "/api/search"],
    }