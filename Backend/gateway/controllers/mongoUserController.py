from fastapi import APIRouter
import httpx, os

router = APIRouter(prefix="/api/mongo/users")

NODE_URL = os.getenv("NODE_URL", "http://localhost:8002").rstrip("/")


@router.get("")
async def get_all_mongo_users(page: int = 1, size: int = 20):
    """Get all users stored in MongoDB."""
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/users?page={page}&size={size}")
    return response.json()


@router.get("/{sql_id}")
async def get_mongo_user(sql_id: int):
    """Get a single user from MongoDB by their SQL id."""
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/users/{sql_id}")
    return response.json()
