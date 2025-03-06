def create_test_user(app):
    with app.app_context():
        db = __import__("app.db", fromlist=["get_db"]).get_db()
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO student (studentname, password, first_name, last_name, email) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                ("teststudent", "hashedpassword", "Test", "Student", "test@student.com")
            )
            user_id = cursor.fetchone()[0]
        db.commit()
        return user_id

def create_test_class(app, student_id, class_name="Test Class", class_code="TC101"):
    with app.app_context():
        db = __import__("app.db", fromlist=["get_db"]).get_db()
        with db.cursor() as cursor:
            cursor.execute(
                "INSERT INTO class (class_name, class_code, student_id) VALUES (%s, %s, %s) RETURNING id",
                (class_name, class_code, student_id)
            )
            class_id = cursor.fetchone()[0]
        db.commit()
        return class_id

def test_manage_class(client, app):
    user_id = create_test_user(app)
    class_id = create_test_class(app, user_id, "Math", "MATH101")
    with client.session_transaction() as sess:
        sess["student_id"] = user_id
    response = client.get(f"/manage_classes/manage_class/{class_id}")
    assert response.status_code == 200
    assert b"Math" in response.data

def test_create_class(client, app):
    user_id = create_test_user(app)
    with client.session_transaction() as sess:
        sess["student_id"] = user_id
    response = client.post("/dashboard/create_class", data={
        "class_name": "Science",
        "class_code": "SCI101"
    })
    assert response.status_code == 302
    with app.app_context():
        db = __import__("app.db", fromlist=["get_db"]).get_db()
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM class WHERE class_name = %s", ("Science",))
            row = cursor.fetchone()
            assert row is not None

def test_edit_class(client, app):
    user_id = create_test_user(app)
    class_id = create_test_class(app, user_id, "History", "HIST101")
    with client.session_transaction() as sess:
        sess["student_id"] = user_id
    response = client.post(f"/dashboard/{class_id}/edit_class", data={
        "class_name": "Modern History",
        "class_code": "HIST201"
    })
    assert response.status_code == 302
    with app.app_context():
        db = __import__("app.db", fromlist=["get_db"]).get_db()
        with db.cursor() as cursor:
            cursor.execute("SELECT class_name FROM class WHERE id = %s", (class_id,))
            updated = cursor.fetchone()[0]
            assert updated == "Modern History"

def test_delete_class(client, app):
    user_id = create_test_user(app)
    class_id = create_test_class(app, user_id, "Geography", "GEO101")
    with client.session_transaction() as sess:
        sess["student_id"] = user_id
    response = client.post(f"/dashboard/{class_id}/delete_class")
    assert response.status_code == 302
    with app.app_context():
        db = __import__("app.db", fromlist=["get_db"]).get_db()
        with db.cursor() as cursor:
            cursor.execute("SELECT * FROM class WHERE id = %s", (class_id,))
            assert cursor.fetchone() is None