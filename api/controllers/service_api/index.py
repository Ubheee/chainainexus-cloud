from flask_restful import Resource  # type: ignore

from configs import can20_config
from controllers.service_api import api


class IndexApi(Resource):
    def get(self):
        return {
            "welcome": "CAN20 OpenAPI",
            "api_version": "v1",
            "server_version": can20_config.CURRENT_VERSION,
        }


api.add_resource(IndexApi, "/")
