from can20_app import CAN20App
from configs import can20_config


def init_app(app: CAN20App):
    app.secret_key = can20_config.SECRET_KEY
