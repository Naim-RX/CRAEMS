import logging
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import declarative_base
from app.core.config import settings

logger = logging.getLogger("craems.database")

Base = declarative_base()

def get_engine():
    async def _test_mysql():
        eng = create_async_engine(settings.DATABASE_URL, echo=False, pool_pre_ping=True, pool_recycle=3600)
        try:
            async with eng.connect() as conn:
                pass
            return eng
        except Exception as e:
            logger.warning(f"MySQL unavailable ({e}). Defaulting to local SQLite fallback database.")
            return create_async_engine(settings.SQLITE_FALLBACK_URL, echo=False)

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            return create_async_engine(settings.SQLITE_FALLBACK_URL, echo=False)
        return loop.run_until_complete(_test_mysql())
    except Exception:
        return asyncio.run(_test_mysql())

engine = get_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
