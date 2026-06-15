from fastapi import APIRouter
import httpx, os

router = APIRouter(prefix="/api/borrows")

SPRING_URL = os.getenv(
    "SPRING_URL",
    os.getenv("SPRING_BOOT_URL", "http://localhost:8081"),
).rstrip("/") + "/"

@router.get("")
async def get_all():
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "borrow")
    return response.json()

@router.get("/overdue")
async def get_overdue():
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + "borrow/overdue")
    return response.json()

@router.get("/user/{user_id}")
async def get_by_user(user_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.get(SPRING_URL + f"borrow/user/{user_id}")
    return response.json()

@router.post("/borrow")
async def borrow_book(userId: int, bookId: int, borrowDays: int = 14):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + f"borrow/borrow?userId={userId}&bookId={bookId}&borrowDays={borrowDays}"
        )
    return response.json()

@router.put("/{borrow_id}/return")
async def return_book(borrow_id: int):
    async with httpx.AsyncClient() as client:
        response = await client.put(SPRING_URL + f"borrow/{borrow_id}/return")
    return response.json()
