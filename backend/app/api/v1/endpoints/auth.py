from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.core.exceptions import InvalidCredentialsException
from app.models.user import User, Role, Department
from app.schemas.user_schema import UserRegister, UserLogin, TokenResponse, UserOut

router = APIRouter()

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
