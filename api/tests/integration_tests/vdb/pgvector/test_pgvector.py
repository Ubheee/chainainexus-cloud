from core.rag.datasource.vdb.pgvector.pgvector import PGVector, PGVectorConfig
from tests.integration_tests.vdb.test_vector_store import (
    AbstractVectorTest,
    get_example_text,
    setup_mock_redis,
)


class PGVectorTest(AbstractVectorTest):
    def __init__(self):
        super().__init__()
        self.vector = PGVector(
            collection_name=self.collection_name,
            config=PGVectorConfig(
                host="localhost",
                port=5433,
                user="postgres",
                password="can20ai123456",
                database="can20",
                min_connection=1,
                max_connection=5,
            ),
        )


def test_pgvector(setup_mock_redis):
    PGVectorTest().run_all_tests()
