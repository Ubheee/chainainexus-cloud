from can20_app import CAN20App
from models import db


def init_app(app: CAN20App):
    db.init_app(app)
