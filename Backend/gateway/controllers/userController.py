from fastapi import APIRouter
from models.schemas import UserCreateSchema, UserUpdateSchema
import httpx

router = APIRouter(prefix="/api/users")

SPRING_URL = "http://localhost:8081/"

@router.get("")
async def get_all():
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "user")
    return response.json()

@router.get("/{user_id}")
async def get_by_id(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"user/{user_id}")
    return response.json()

@router.post("")
async def create(user: UserCreateSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(SPRING_URL + "user", json=user.model_dump())
    return response.json()

@router.put("/{user_id}")
async def update(user_id: int, user: UserUpdateSchema):
    async with httpx.AsyncClient() as client:
        response = await client.put(SPRING_URL + f"user/{user_id}", json=user.model_dump())
    return response.json()

@router.delete("/{user_id}")
async def delete(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.delete(SPRING_URL + f"user/{user_id}")
    return response.json()
