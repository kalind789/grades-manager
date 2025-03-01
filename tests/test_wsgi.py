import pytest
from app import create_app

def test_wsgi_app():
    """Test WSGI app creation."""
    app = create_app()
    assert app is not None  # Ensure the app is created 