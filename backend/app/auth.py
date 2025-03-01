import functools
from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify)
from werkzeug.security import check_password_hash, generate_password_hash
from app.db import get_db
import psycopg2
from flask_jwt_extended import create_access_token

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=("GET", "POST"))
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

    error = None
    
    if not studentname:
        error = 'Must enter studentname!'
        return jsonify({"error": error}), 400
    elif not password1 or not password2:
        error = 'Must enter both passwords!'
        return jsonify({"error": error}), 400
    elif not first_name:
        error = 'Must enter first name'
        return jsonify({"error": error}), 400
    elif not last_name:
        error = 'Must enter last name'
        return jsonify({"error": error}), 400
    elif password1 != password2:
        error = 'Both passwords must be the same'
        return jsonify({"error": error}), 400

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
        error = f"Student {studentname} is already registered"
        return jsonify({"error": error}), 400
    
    return jsonify({"message": "Registration Sucessful"}), 201

@bp.route('/login', methods=('GET', 'POST'))
def login():
    db = get_db()
    cursor = db.cursor()
    data = request.get_json()
    studentname = data.get('studentname')
    password = data.get('password')
    error = None

    cursor.execute(
        'SELECT id, studentname, password FROM student WHERE studentname = %s', (studentname,)
    )
    student = cursor.fetchone()

    if student is None:
        error = 'Wrong username OR please register'
        return jsonify({"error": error}), 401
    elif not check_password_hash(student[2], password): 
        error = 'Incorrect Password'
        return jsonify({"error": error}), 401
    
    access_token = create_access_token(identity=studentname)
        
    return jsonify({"message": "Login Successful!", "access_token":access_token}), 200
        
@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))