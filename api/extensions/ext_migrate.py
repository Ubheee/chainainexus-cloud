from can20_app import CAN20App


def init_app(app: CAN20App):
    import flask_migrate  # type: ignore

    from extensions.ext_database import db

    flask_migrate.Migrate(app, db)
