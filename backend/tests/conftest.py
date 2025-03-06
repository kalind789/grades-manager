import os
import pytest
from app import create_app
from app.db import get_db

@pytest.fixture
def app():
    """Creates a test app with a temporary database"""
    app = create_app({
        "TESTING": True,
        "DATABASE": "postgresql://postgres:test@localhost/test_db"
    })

    with app.app_context():
        db = get_db()
        schema_path = os.path.join(os.path.dirname(__file__), "../app/schema.sql")  # ✅ Fix the path
        with open(schema_path, "r") as f:
            db.cursor().execute(f.read())
        db.commit()

    yield app