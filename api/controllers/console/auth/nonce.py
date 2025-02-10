from flask import abort, request
from flask_restful import Resource  # type: ignore

from controllers.console import api
from controllers.console.wraps import setup_required
from utils.nonce import generate_nonce, store_nonce


class NonceApi(Resource):
    @setup_required
    def post(self):
        try:
            # Generate a new nonce
            public_key = request.json.get('public_key')
            if not public_key:
                abort(400, 'Public key is required')
                
            nonce = generate_nonce()
            print("nonce", nonce)
            # Store nonce with public key and timestamp
            store_nonce(public_key, nonce)
            
            return {
                'result': 'success',
                'data': {
                    'nonce': nonce
                }
            }
        except Exception as e:
            abort(500, str(e))


api.add_resource(NonceApi, '/nonce') 