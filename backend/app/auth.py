from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from app.db import get_db
import psycopg2
from flask_jwt_extended import create_access_token

bp = Blueprint('auth', __name__, url_prefix='/auth')


@bp.route('/register', methods=["POST"])
def register():
    db = get_db()
    cursor = db.cursor()
    data = request.get_json()

    studentname = data.get('studentname')
    password1 = data.get('password1')
    password2 = data.get('password2')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')

    if not studentname:
        return jsonify({"error": 'Must enter studentname!'}), 400
    if not password1 or not password2:
        return jsonify({"error": 'Must enter both passwords!'}), 400
    if not first_name:
        return jsonify({"error": 'Must enter first name'}), 400
    if not last_name:
        return jsonify({"error": 'Must enter last name'}), 400
    if password1 != password2:
        return jsonify({"error": 'Both passwords must be the same'}), 400

    try:
        cursor.execute(
            """
            INSERT INTO student (studentname, password, first_name, last_name, email)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (studentname, generate_password_hash(password1), first_name, last_name, email),
        )
        db.commit()
    except psycopg2.IntegrityError:
        db.rollback()
        return jsonify({"error": f"Student {studentname} is already registered"}), 400

    return jsonify({"message": "Registration successful"}), 201


@bp.route('/login', methods=["POST"])
def login():
    db = get_db()
    cursor = db.cursor()
    data = request.get_json()
    studentname = data.get('studentname')
    password = data.get('password')

    cursor.execute(
        'SELECT id, studentname, password FROM student WHERE studentname = %s',
        (studentname,)
    )
    student = cursor.fetchone()

    if student is None:
        return jsonify({"error": 'Wrong username OR please register'}), 401
    if not check_password_hash(student[2], password):
        return jsonify({"error": 'Incorrect password'}), 401

    access_token = create_access_token(identity=studentname)

    return jsonify({"message": "Login successful!", "access_token": access_token}), 200


@bp.route('/logout', methods=["POST"])
def logout():
    return jsonify({"message": "Logout successful on client side (token deleted)."}), 200