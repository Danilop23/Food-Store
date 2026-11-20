
from datetime import datetime

from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)

    full_name: str = Field(min_length=2, max_length=100)

    email: str = Field(min_length=5, max_length=255)

    password: str = Field(min_length=8)


class UserPublic(SQLModel):
    id: int

    username: str

    full_name: str

    email: str

    role: str

    disabled: bool

    created_at: datetime
