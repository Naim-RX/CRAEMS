import os
from typing import List, Union
# pyrefly: ignore [missing-import]
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CRAEMS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "craems_super_secret_jwt_key_change_in_production_environment"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = ""
    MYSQL_HOST: str = "127.0.0.1"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "craems_db"

    DATABASE_URL: str = "mysql+aiomysql://root:your_password@127.0.0.1:3306/craems_db"
    SQLITE_FALLBACK_URL: str = "sqlite+aiosqlite:///./craems.db"

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
