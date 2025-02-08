from can20_app import CAN20App
from configs import can20_config


def is_enabled() -> bool:
    return can20_config.API_COMPRESSION_ENABLED


def init_app(app: CAN20App):
    from flask_compress import Compress  # type: ignore

    compress = Compress()
    compress.init_app(app)
