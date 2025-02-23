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
        error = None
        
        if username is None:
            error = 'Must enter username!'
        elif password1 is None or password2 is None:
            error = 'Must enter both passwords!'
        elif password1 != password2:
            error = 'Both passswords must be the same'

        if error is None:
            try:
                db.execute(
                    """
                        INTSERT INTO user (username, password)
                        VALUES (?, ?)
                    """,
                    (username, generate_password_hash(password1)),
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
            session['user_id'] = user['id']
            return redirect(url_for('app.dashboard'))
        
        flash(error)
    return render_template('auth/login.html')