from can20_app import CAN20App


def init_app(app: CAN20App):
    from events import event_handlers  # noqa: F401
