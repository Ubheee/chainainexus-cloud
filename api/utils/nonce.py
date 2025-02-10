import secrets
from typing import Optional

from redis import Redis

from configs import can20_config

redis_client = Redis(
    host=can20_config.REDIS_HOST,
    port=can20_config.REDIS_PORT,
    password=can20_config.REDIS_PASSWORD,
    db=can20_config.REDIS_DB
)

NONCE_EXPIRE_TIME = 300  # 5 minutes


def generate_nonce() -> str:
    """Generate a random nonce"""
    return secrets.token_hex(32)


def store_nonce(public_key: str, nonce: str) -> None:
    """Store nonce in Redis with expiration"""
    key = f"wallet_nonce:{public_key}"
    redis_client.setex(key, NONCE_EXPIRE_TIME, nonce)


def get_current_nonce(public_key: str) -> Optional[str]:
    """Get current nonce for public key"""
    key = f"wallet_nonce:{public_key}"
    nonce = redis_client.get(key)
    return nonce.decode('utf-8') if nonce else None


def verify_and_remove_nonce(public_key: str, nonce: str) -> bool:
    """Verify nonce and remove it if valid"""
    stored_nonce = get_current_nonce(public_key)
    if stored_nonce and stored_nonce == nonce:
        redis_client.delete(f"wallet_nonce:{public_key}")
        return True
    return False 