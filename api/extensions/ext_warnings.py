from can20_app import CAN20App


def init_app(app: CAN20App):
    import warnings

    warnings.simplefilter("ignore", ResourceWarning)
