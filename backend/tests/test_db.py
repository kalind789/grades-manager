import pytest
from app.db import get_db, init_db

def test_init_db(client):
    """Test database initialization."""
    with client.application.app_context():
        init_db()  # Initialize the database
        db = get_db()
        with db.cursor() as cursor:
            # Example: Check if the student table exists.
            cursor.execute("SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'student');")
            exists = cursor.fetchone()[0]
            assert exists is True

def test_get_db(client):
    """Test getting the database connection."""
    with client.application.app_context():
        db = get_db()
        assert db is not None
