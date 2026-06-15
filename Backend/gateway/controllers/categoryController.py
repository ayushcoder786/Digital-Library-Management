from fastapi import APIRouter
from models.schemas import CategoryCreateSchema, CategoryUpdateSchema
import httpx, os

router = APIRouter(prefix="/api/categories")

SPRING_URL = os.getenv(
    "SPRING_URL",
    os.getenv("SPRING_BOOT_URL", "http://localhost:8081"),
).rstrip("/") + "/"

@router.get("")
async def get_all():
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "category")
    return response.json()

@router.get("/{category_id}")
async def get_by_id(category_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"category/{category_id}")
    return response.json()

@router.post("")
async def create(category: CategoryCreateSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(SPRING_URL + "category", json=category.model_dump())
    return response.json()

@router.put("/{category_id}")
async def update(category_id: int, category: CategoryUpdateSchema):
    async with httpx.AsyncClient() as client:
        response = await client.put(SPRING_URL + f"category/{category_id}", json=category.model_dump())
    return response.json()

@router.delete("/{category_id}")
async def delete(category_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.delete(SPRING_URL + f"category/{category_id}")
    return response.json()
