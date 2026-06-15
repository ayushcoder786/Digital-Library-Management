from fastapi import APIRouter
from typing import Optional
import httpx, os

router = APIRouter(prefix="/api/search")

NODE_URL = os.getenv("NODE_URL", "http://localhost:8002").rstrip("/")

@router.get("")
async def vector_search(q: str, topK: int = 5):
    """
    Semantic / vector search over MongoDB book_contents.
    Uses cosine similarity on TF-IDF embeddings.
    Accepts a natural language query and returns ranked book results.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/search?q={q}&topK={topK}")
    return response.json()

@router.post("/content")
async def upsert_book_content(body: dict):
    """
    Store or update book content + embedding in MongoDB.
    Called when a book is created/updated in Spring Boot.
    Body: { bookId, title, author, description, tags[] }
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(NODE_URL + "/search/content", json=body)
    return response.json()

@router.get("/content")
async def list_book_contents(page: int = 1, size: int = 20):
    """List all books that have MongoDB content/embeddings."""
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/search/content?page={page}&size={size}")
    return response.json()

@router.get("/content/{book_id}")
async def get_book_content(book_id: int):
    """Get stored description and tags for a specific book."""
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/search/content/{book_id}")
    return response.json()

@router.delete("/content/{book_id}")
async def delete_book_content(book_id: int):
    """Delete book content from MongoDB when book is removed from SQL."""
    async with httpx.AsyncClient() as client:
        response = await client.delete(NODE_URL + f"/search/content/{book_id}")
    return response.json()
