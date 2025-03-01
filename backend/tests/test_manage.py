import pytest
from app.db import get_db

def create_test_user(app):
    with app.app_context():
        db = get_db()
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO student (studentname, password, first_name, last_name, email) "
                "VALUES (%s, %s, %s, %s, %s) RETURNING id",
                ("testuser", "hashedpassword", "Test", "User", "testuser@example.com")
            )
            user_id = cursor.fetchone()[0]
        db.commit()
        return user_id

def create_test_class(app, student_id):
    with app.app_context():
        db = get_db()
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO class (class_name, class_code, student_id) VALUES (%s, %s, %s) RETURNING id",
                ("Test Class", "TC101", student_id)
            )
            class_id = cursor.fetchone()[0]
        db.commit()
        return class_id

def test_create_section(client, app):
    # Ensure a test user and a test class exist
    student_id = create_test_user(app)
    class_id = create_test_class(app, student_id)
    
    # Simulate a logged-in user by setting the session with a test student dictionary
    with client.session_transaction() as sess:
        sess["student"] = {"id": student_id}

    # Post to create a section for the valid class_id
    response = client.post(f"/section/create_section/{class_id}", data={
        "section_name": "New Section",
        "section_weight": "10"
    })
    assert response.status_code == 302  # Expect a redirect

    # Verify the section was inserted in the test database
    with app.app_context():
        db = get_db()
        with db.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM section WHERE section_name = %s AND class_id = %s",
                ("New Section", class_id)
            )
            section = cursor.fetchone()
            assert section is not None