import pytest
from app import create_app

def test_create_app_with_config():
    """Test app creation with a test configuration."""
    app = create_app(test_config={'DATABASE': 'sqlite:///:memory:'})
    assert app.config['DATABASE'] == 'sqlite:///:memory:'

def test_create_app_without_config():
    """Test app creation without a test configuration."""
    app = create_app()
    assert app.config['DATABASE'] is not None  # Assuming DATABASE_URL is set in .env

def test_hello_route(client):
    """Test the /hello route."""
    response = client.get('/hello')
    assert response.data == b'Hello, World!'
    assert response.status_code == 200 