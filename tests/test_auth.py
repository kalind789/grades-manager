import pytest
from flask import session
from app.auth import login_required
from flask import Response

def test_register(client, app):
    response = client.post("/auth/register", data={
        "studentname": "newuser",
        "password1": "password",
        "password2": "password",
        "first_name": "New",
        "last_name": "User",
        "email": "newuser@example.com"
    })
    # Registration should redirect (302)
    assert response.status_code == 302
    with app.app_context():
        from app.db import get_db
        db = get_db()
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM student WHERE studentname = %s", ("newuser",))
            row = cursor.fetchone()
            assert row is not None

def test_login_logout(client, app):
    # Register the user first.
    client.post("/auth/register", data={
        "studentname": "loginuser",
        "password1": "password",
        "password2": "password",
        "first_name": "Login",
        "last_name": "User",
        "email": "loginuser@example.com"
    })
    # Login
    response = client.post("/auth/login", data={
        "studentname": "loginuser",
        "password": "password"
    })
    assert response.status_code == 302
    with client.session_transaction() as sess:
        assert "student_id" in sess
    # Logout
    response = client.get("/auth/logout")
    assert response.status_code == 302
    with client.session_transaction() as sess:
        assert "student_id" not in sess

def test_login_required(client):
    @login_required
    def protected_view():
        return "Protected"
    
    # Clear session to simulate not logged in.
    with client.session_transaction() as sess:
        sess.clear()
    with client.application.test_request_context():
        result = protected_view()
        # The decorator should redirect to the login page.
        assert isinstance(result, Response)
        # result.location should point to the login endpoint.
        assert "/auth/login" in result.location

def test_login_failure(client):
    # Attempt login with non-existent credentials.
    response = client.post("/auth/login", data={
        "studentname": "nonexistent",
        "password": "wrong"
    })
    # On failure, assume login renders the page with an error (200)
    assert response.status_code == 200
    assert b"Wrong studentname OR please register" in response.data