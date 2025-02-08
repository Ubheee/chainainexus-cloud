import os
import time

from can20_app import CAN20App


def init_app(app: CAN20App):
    os.environ["TZ"] = "UTC"
    # windows platform not support tzset
    if hasattr(time, "tzset"):
        time.tzset()
