from can20_app import CAN20App
from configs import can20_config


def init_app(app: CAN20App):
    if can20_config.RESPECT_XFORWARD_HEADERS_ENABLED:
        from werkzeug.middleware.proxy_fix import ProxyFix

        app.wsgi_app = ProxyFix(app.wsgi_app)  # type: ignore
