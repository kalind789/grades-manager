import functools
from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash
from app.db import get_db
import psycopg2

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=("GET", "POST"))
def register():
    if request.method == 'POST':
        db = get_db()
        cursor = db.cursor()
        studentname = request.form['studentname']
        password1 = request.form['password1']
        password2 = request.form['password2']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form['email']

        error = None
        
        if not studentname:
            error = 'Must enter studentname!'
        elif not password1 or not password2:
            error = 'Must enter both passwords!'
        elif not first_name:
            error = 'Must enter first name'
        elif not last_name:
            error = 'Must enter last name'
        elif password1 != password2:
            error = 'Both passwords must be the same'

        if error is None:
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
                db.rollback()  # ✅ Required to prevent locked transactions
                error = f"Student {studentname} is already registered"
            else:
                return redirect(url_for('auth.login'))
        
        flash(error)

    return render_template('auth/register.html')

@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        db = get_db()
        cursor = db.cursor()

        studentname = request.form['studentname']
        password = request.form['password']
        error = None

        cursor.execute(
            'SELECT id, studentname, password FROM student WHERE studentname = %s', (studentname,)
        )
        student = cursor.fetchone()  # ✅ Properly fetches the tuple

        if student is None:
            error = 'Wrong studentname OR please register'
        elif not check_password_hash(student[2], password):  # ✅ Fix index-based access
            error = 'Incorrect Password'
        
        if error is None:
            session.clear()
            session.permanent = True
            session['student_id'] = student[0]  # ✅ Fix index-based access
            return redirect(url_for('dashboard.dashboard'))
        
        flash(error)
    return render_template('auth/login.html')

@bp.before_app_request
def load_logged_in_student():
    """
    Registers a view to run before the view function, no matter what URL is requested.
    Checks if the student_id is stored in the session, and then gets all of that student's data.
    """
    student_id = session.get('student_id')

    if student_id is None:
        g.student = None
    else:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'SELECT id, studentname, first_name, last_name, email FROM student WHERE id = %s', (student_id,)
        )
        student = cursor.fetchone()

        if student:
            g.student = {
                "id": student[0],
                "studentname": student[1],
                "first_name": student[2],
                "last_name": student[3],
                "email": student[4],
            }
        else:
            g.student = None  # Handle case where student no longer exists
        
@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Require authentication in other views
def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        """
        Checks if a student is loaded, if not, it takes you back to the login page. 
        """
        if g.student is None:
            return redirect(url_for('auth.login'))
        
        return view(**kwargs)
    
    return wrapped_view