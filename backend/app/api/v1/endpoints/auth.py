from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.exceptions import InvalidCredentialsException
from app.models.user import User, Role, Department
from app.schemas.user_schema import UserRegister, UserLogin, TokenResponse, UserOut
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import random
import string

router = APIRouter()

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    normalized_email = user_in.email.strip().lower()

    # Check if email exists
    existing = await db.execute(select(User).where(User.email == normalized_email))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    # Find role
    role_res = await db.execute(select(Role).where(Role.name == user_in.role_name))
    role = role_res.scalars().first()
    if not role:
        # Fallback to STUDENT
        role_res = await db.execute(select(Role).where(Role.name == "STUDENT"))
        role = role_res.scalars().first()
        if not role:
            # Create default STUDENT role if not exists
            role = Role(name="STUDENT", description="Standard Student Role")
            db.add(role)
            await db.flush()

    new_user = User(
        full_name=user_in.full_name,
        email=normalized_email,
        password_hash=get_password_hash(user_in.password),
        phone=user_in.phone,
        department_id=user_in.department_id,
        role_id=role.id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Fetch complete user for response
    query = select(User).options(
        selectinload(User.role),
        selectinload(User.department)
    ).where(User.id == new_user.id)
    res = await db.execute(query)
    user_loaded = res.scalars().first()
    return user_loaded

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    normalized_email = credentials.email.strip().lower()
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.role),
            selectinload(User.department)
        )
        .where(User.email == normalized_email)
    )
    user = result.scalars().first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise InvalidCredentialsException()

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated. Contact Administrator.")

    access_token = create_access_token(subject=user.id, role=user.role.name)
    refresh_token = create_refresh_token(subject=user.id)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Step 1: Check if the email exists. If it does, generate a 6-digit reset code
    and store it on the user record (expires in 15 minutes).
    In production the code would be emailed. For this demo it is returned in the response.
    """
    normalized_email = req.email.strip().lower()
    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="No account registered with this email address."
        )

    # Generate a 6-digit numeric OTP code
    code = "".join(random.choices(string.digits, k=6))
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)

    user.password_reset_code = code
    user.password_reset_expires = expires
    await db.commit()

    # In production: send email here.
    # For demo: return the code directly in the response.
    return {
        "message": "Reset code generated successfully.",
        "demo_code": code,
        "expires_in_minutes": 15
    }

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Step 2: Validate the reset code and update the password.
    """
    normalized_email = req.email.strip().lower()
    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalars().first()

    if not user or not user.password_reset_code:
        raise HTTPException(status_code=400, detail="Invalid or expired reset code.")

    # Check expiry (ensure timezone aware comparison)
    now = datetime.now(timezone.utc)
    expires = user.password_reset_expires
    if expires and expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if not expires or now > expires:
        raise HTTPException(status_code=400, detail="Reset code has expired. Please request a new one.")

    if user.password_reset_code != req.code.strip():
        raise HTTPException(status_code=400, detail="Incorrect reset code. Please try again.")

    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user.password_hash = get_password_hash(req.new_password)
    user.password_reset_code = None
    user.password_reset_expires = None
    await db.commit()

    return {"message": "Password reset successfully. You can now log in with your new password."}
