import pytest
from app.db import get_db
from app import create_app

def create_test_user(app):
    """Creates a test user and returns its id."""
    with app.app_context():
        db = get_db()
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO student (studentname, password, first_name, last_name, email) "
                "VALUES (%s, %s, %s, %s, %s) RETURNING id",
                ("testuser", "hashedpassword", "Test", "User", "test@example.com")
            )
            user_id = cursor.fetchone()[0]
        db.commit()
        return user_id

def create_test_class(app, student_id, class_name="Test Class", class_code="TC101"):
    """Creates a test class for a given student and returns its id."""
    with app.app_context():
        db = get_db()
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO class (class_name, class_code, student_id) VALUES (%s, %s, %s) RETURNING id",
                (class_name, class_code, student_id)
            )
            class_id = cursor.fetchone()[0]
        db.commit()
        return class_id

def test_get_sections(client):
    """Test getting sections for a class."""
    # Call the endpoint; it returns JSON.
    response = client.get('/section/get_sections/1')
    assert response.status_code == 200
    # Verify that the JSON response contains a key "sections"
    data = response.get_json()
    assert "sections" in data

def test_create_section(client, app):
    """Test creating a section."""
    # Simulate a logged-in user by setting a dummy student dictionary in the session.
    with client.session_transaction() as sess:
        sess['student'] = {'id': 1}  # Adjust if necessary

    response = client.post('/section/create_section/1', data={
        'section_name': 'New Section',
        'section_weight': 10
    })
    assert response.status_code == 302  # Redirect after creation