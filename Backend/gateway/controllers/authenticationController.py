from fastapi import APIRouter, Header
from models.schemas import SigninSchema, SignupSchema
import httpx, os

router = APIRouter(prefix="/api/auth")

SPRING_URL = os.getenv(
    "SPRING_URL",
    os.getenv("SPRING_BOOT_URL", "http://localhost:8081"),
).rstrip("/") + "/"
NODE_URL = os.getenv("NODE_URL", "http://localhost:8002").rstrip("/")


async def _sync_user_to_mongo(user: dict, event: str):
    """
    Fire-and-forget: push user data to the Node.js / MongoDB service.
    Errors are silently swallowed so they never break the main login flow.
    """
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(
                NODE_URL + "/users/upsert",
                json={**user, "event": event},
            )
    except Exception:
        pass   # Non-critical — SQL auth already succeeded


@router.post("/login")
async def login(U: SigninSchema):
    print("SPRING_URL =", SPRING_URL)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "user/signin",
            json=U.model_dump()
        )

    print("SPRING STATUS =", response.status_code)
    print("SPRING RESPONSE =", response.text)

    return {"status": response.status_code}

@router.post("/register")
async def register(U: SignupSchema):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "user/signup",
            json=U.model_dump())
    data = response.json()

    # Sync new user to MongoDB (non-blocking, best-effort)
    user = data.get("user") or {}
    if user.get("id"):
        await _sync_user_to_mongo(user, "REGISTER")

    return data


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
