from base58 import b58decode
from nacl.exceptions import BadSignatureError
from nacl.signing import VerifyKey


def verify_solana_signature(public_key: str, signature: list, message: str) -> bool:
    """Verify a Solana wallet signature"""
    try:
        # Convert public key from base58 to bytes
        public_key_bytes = b58decode(public_key)
        
        # Create verify key from public key bytes
        verify_key = VerifyKey(public_key_bytes)
        
        # Convert signature list to bytes
        signature_bytes = bytes(signature)
        
        # Convert message to bytes
        message_bytes = message.encode()
        
        # Verify the signature
        verify_key.verify(message_bytes, signature_bytes)
        return True
        
    except (BadSignatureError, ValueError, Exception):
        return False 