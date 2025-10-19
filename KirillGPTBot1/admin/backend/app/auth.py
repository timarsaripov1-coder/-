import os
import logging
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

logger = logging.getLogger(__name__)

# Получаем токен из переменной окружения или устанавливаем дефолтный
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "admin-secret-token-2025")

if ADMIN_TOKEN == "admin-secret-token-2025":
    logger.warning("Using default ADMIN_TOKEN. Please set ADMIN_TOKEN environment variable for production.")

security = HTTPBearer(auto_error=False)

async def verify_token(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)):
    """Verify admin token for API access"""
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authorization token required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(
            status_code=403,
            detail="Invalid authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return credentials.credentials

def verify_websocket_token(token: Optional[str]) -> bool:
    """Verify token for WebSocket connections"""
    if not token:
        return False
    return token == ADMIN_TOKEN