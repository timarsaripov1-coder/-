from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import os
import logging

logger = logging.getLogger(__name__)

# Database URL validation and setup
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to SQLite for development if no PostgreSQL available
    DATABASE_URL = "sqlite+aiosqlite:///./dev_database.db"
    logger.warning("DATABASE_URL not found. Using SQLite fallback for development.")
    ASYNC_DATABASE_URL = DATABASE_URL
else:
    # Convert postgres:// to postgresql:// if needed
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # Convert to async URL for PostgreSQL
    if DATABASE_URL.startswith("postgresql://"):
        # Remove unsupported parameters for asyncpg
        import urllib.parse
        parsed = urllib.parse.urlparse(DATABASE_URL)
        
        # Filter out unsupported query parameters
        query_params = urllib.parse.parse_qs(parsed.query)
        # Remove sslmode and other parameters that asyncpg doesn't support
        filtered_params = {k: v for k, v in query_params.items() 
                          if k not in ['sslmode', 'connect_timeout']}
        
        # Rebuild URL without problematic parameters
        new_query = urllib.parse.urlencode(filtered_params, doseq=True)
        clean_url = urllib.parse.urlunparse((
            parsed.scheme, parsed.netloc, parsed.path,
            parsed.params, new_query, parsed.fragment
        ))
        
        ASYNC_DATABASE_URL = clean_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        if query_params.keys() != filtered_params.keys():
            logger.info(f"Removed unsupported asyncpg parameters: {set(query_params.keys()) - set(filtered_params.keys())}")
    else:
        ASYNC_DATABASE_URL = DATABASE_URL
        
logger.info(f"Using database: {'PostgreSQL' if 'postgresql' in ASYNC_DATABASE_URL else 'SQLite'}")

try:
    async_engine = create_async_engine(ASYNC_DATABASE_URL, echo=True)
    AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)
except Exception as e:
    logger.error(f"Failed to create database engine: {e}")
    raise RuntimeError(f"Database connection failed. Please check DATABASE_URL configuration: {e}")

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()