from typing import Optional
from pydantic import BaseModel, Field

class UsernameRequest(BaseModel):
    username: str = Field(min_length=1, max_length=39)

class RoleRequest(UsernameRequest):
    role: str = Field(min_length=1, max_length=60)

class CompanyRequest(RoleRequest):
    company: str = Field(min_length=1, max_length=60)

class RoadmapRequest(UsernameRequest):
    role: Optional[str] = Field(default=None, max_length=60)
