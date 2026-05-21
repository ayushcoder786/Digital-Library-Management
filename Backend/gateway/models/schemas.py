
from pydantic import BaseModel
from typing import Optional

# ── Auth ──────────────────────────────────────────────────────────────────────

class SigninSchema(BaseModel):
    username: str
    password: str

class SignupSchema(BaseModel):
    username: str
    firstName: str
    lastName: Optional[str] = ""
    email: str
    phoneNumber: Optional[str] = ""
    address: Optional[str] = ""
    role: Optional[str] = "MEMBER"
    maxBorrowLimit: Optional[int] = 5
    password: str

# ── Book ──────────────────────────────────────────────────────────────────────

class BookCreateSchema(BaseModel):
    title: str
    author: str
    isbn: str
    categoryId: Optional[int] = None
    description: Optional[str] = None
    publishedDate: Optional[str] = None
    publisher: Optional[str] = None
    totalCopies: Optional[int] = 1
    availableCopies: Optional[int] = 1
    coverImageUrl: Optional[str] = None
    language: Optional[str] = "English"
    pageCount: Optional[int] = None
    isActive: Optional[bool] = True

class BookUpdateSchema(BookCreateSchema):
    pass

# ── User ──────────────────────────────────────────────────────────────────────

class UserCreateSchema(BaseModel):
    username: str
    firstName: str
    lastName: Optional[str] = ""
    email: str
    phoneNumber: Optional[str] = ""
    address: Optional[str] = ""
    role: Optional[str] = "MEMBER"
    maxBorrowLimit: Optional[int] = 5
    password: Optional[str] = None
    isActive: Optional[bool] = True

class UserUpdateSchema(UserCreateSchema):
    pass

# ── Category ─────────────────────────────────────────────────────────────────

class CategoryCreateSchema(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryUpdateSchema(CategoryCreateSchema):
    pass