from fastapi import APIRouter
from models.schemas import BookCreateSchema, BookUpdateSchema
import httpx

router = APIRouter(prefix="/api/books")

SPRING_URL = "http://localhost:8081/"

@router.get("")
async def get_all():
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "book")
    return response.json()

@router.get("/available")
async def get_available():
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "book/available")
    return response.json()

@router.get("/search")
async def search(keyword: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"book/search?keyword={keyword}")
    return response.json()

@router.get("/category/{category_id}")
async def get_by_category(category_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"book/category/{category_id}")
    return response.json()

@router.get("/{book_id}")
async def get_by_id(book_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"book/{book_id}")
    return response.json()

@router.post("")
async def create(book: BookCreateSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(SPRING_URL + "book", json=book.model_dump())
    return response.json()

@router.put("/{book_id}")
async def update(book_id: int, book: BookUpdateSchema):
    async with httpx.AsyncClient() as client:
        response = await client.put(SPRING_URL + f"book/{book_id}", json=book.model_dump())
    return response.json()

@router.delete("/{book_id}")
async def delete(book_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.delete(SPRING_URL + f"book/{book_id}")
    return response.json()
