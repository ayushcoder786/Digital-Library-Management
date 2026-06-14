from fastapi import APIRouter
from typing import Optional
import httpx

router = APIRouter(prefix="/api/logs")

NODE_URL = "http://localhost:8002"

@router.post("")
async def create_log(body: dict):
    """Create a new activity log entry (called internally by other services)."""
    async with httpx.AsyncClient() as client:
        response = await client.post(NODE_URL + "/logs", json=body)
    return response.json()

@router.get("")
async def get_all_logs(page: int = 1, size: int = 20, token: Optional[str] = None):
    """Get all activity logs (admin only – pass JWT token header)."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            NODE_URL + f"/logs?page={page}&size={size}",
            headers={"token": token or ""}
        )
    return response.json()

@router.get("/recent")
async def get_recent_logs(limit: int = 10):
    """Get the most recent N activity logs (for dashboard widget)."""
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + f"/logs/recent?limit={limit}")
    return response.json()

@router.get("/stats")
async def get_log_stats():
    """Get log counts grouped by action type (for analytics charts)."""
    async with httpx.AsyncClient() as client:
        response = await client.get(NODE_URL + "/logs/stats")
    return response.json()

@router.get("/user/{user_id}")
async def get_logs_by_user(user_id: int, page: int = 1, size: int = 20):
    """Get activity logs for a specific user."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            NODE_URL + f"/logs/user/{user_id}?page={page}&size={size}"
        )
    return response.json()
