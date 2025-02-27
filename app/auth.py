import functools
from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for)
from werkzeug.security import check_password_hash, generate_password_hash
from app.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=("GET", "POST"))
def register():
    if request.method == 'POST':
        db = get_db()
        username = request.form['username']
        password1 = request.form['password1']
        password2 = request.form['password2']
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form['email']

        error = None
        
        if not username:
            error = 'Must enter username!'
        elif not password1 or not password2:
            error = 'Must enter both passwords!'
        elif not first_name:
            error = 'Must enter first name'
        elif not last_name:
            error = 'Must enter last name'
        elif password1 != password2:
            error = 'Both passswords must be the same'

        if error is None:
            try:
                db.execute(
                    """
                        INSERT INTO user (username, password, first_name, last_name, email)
                        VALUES (?, ?, ?, ?, ?)
                    """,
                    (username, generate_password_hash(password1), first_name, last_name, email),
                )
                db.commit()
            except db.IntegrityError:
                error = f"User {username} is already registered"
            else:
                return redirect(url_for('auth.login'))
        
        flash(error)

    return render_template('auth/register.html')

@bp.route('/login', methods=('GET', 'POST'))
def login():
    if request.method == 'POST':
        db = get_db()
        username = request.form['username']
        password = request.form['password']
        error = None

        user = db.execute(
            'SELECT * FROM user WHERE username = ?', (username, )
        ).fetchone()

        if user is None:
            error = 'wrong username OR please register'
        elif not check_password_hash(user['password'], password):
            error = 'Incorrect Pasword'
        
        if error is None:
            session.clear()
            session.permanent = True
            session['user_id'] = user['id']
            return redirect(url_for('dashboard.dashboard'))
        
        flash(error)
    return render_template('auth/login.html')

@bp.before_app_request
def load_logged_in_user():
    """
        Registers a view to run before the view function, no matter what url is requested.
        Checks if the user_id is stored in the session, and then get's all of that user's data.
    """
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()
        
@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

# Require authenticaiton in other views
def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        """
            Checks if a user is laoded, if not, it takes you back to the login page. 
        """
        if g.user is None:
            return redirect(url_for('auth.login'))
        
        return view(**kwargs)
    
    return wrapped_view