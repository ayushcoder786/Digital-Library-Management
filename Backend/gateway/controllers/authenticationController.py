from fastapi import APIRouter, Header
from models.schemas import SigninSchema, SignupSchema
import httpx

router = APIRouter(prefix="/api/auth")

SPRING_URL = "http://localhost:8081/"

@router.post("/login")
async def login(U: SigninSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "user/signin",
            json=U.model_dump())
    return response.json()

@router.post("/register")
async def register(U: SignupSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "user/signup",
            json=U.model_dump())
    return response.json()

# ── Legacy routes (kept for backward compatibility) ───────────────────────────

@router.post("/signup")
async def signup(U: SignupSchema):
    return await register(U)

@router.post("/signin")
async def signin(U: SigninSchema):
    return await login(U)

@router.get("/uinfo")
async def uinfo(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "user/uinfo",
            headers={"Token": Token}
        )
    return response.json()

@router.get("/profile")
async def profile(Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + "user/profile",
            headers={"Token": Token}
        )
    return response.json()