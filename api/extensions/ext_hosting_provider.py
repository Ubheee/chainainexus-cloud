from core.hosting_configuration import HostingConfiguration

hosting_configuration = HostingConfiguration()


from can20_app import CAN20App


def init_app(app: CAN20App):
    hosting_configuration.init_app(app)
