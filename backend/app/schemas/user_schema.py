from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleOut(RoleBase):
    id: int
    class Config:
        from_attributes = True

class DepartmentBase(BaseModel):
    code: str
    name: str
    head_faculty_name: Optional[str] = None

class DepartmentOut(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    role_name: str = "STUDENT"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: RoleOut
    department: Optional[DepartmentOut] = None
    is_active: bool
    is_two_factor_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
