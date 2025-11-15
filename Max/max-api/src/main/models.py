from pydantic import BaseModel, Field, ValidationError, model_validator
from typing import Literal, Self
from datetime import datetime


class Event(BaseModel):
    title: str
    description: str
    location: str
    datetime: datetime
    link: str

class User(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    avatar: str | None = None

class CheckData(BaseModel):
    event_id: str
    user_id: int

class RoleData(BaseModel):
    user_id: int
    role: Literal['admin', 'participant']