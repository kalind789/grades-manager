from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from app.auth import login_required
from app.db import get_db

bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@bp.route('/', methods=("GET", "POST"))
@login_required
def dashboard():
    db = get_db()
    classes = db.execute(
        """
            SELECT c.id, c.class_name, c.class_code, c.student_id 
            FROM class c
            WHERE c.student_id = ?
            ORDER BY c.id DESC
        """,
        (g.user['id'],),
    ).fetchall()
    return render_template('dashboard/dashboard.html', classes = classes)

@bp.route('/create_class', methods=("GET", "POST"))
def create_class():
    if request.method == 'POST':
        class_name = request.form['class_name']
        class_code = request.form['class_code']
        error = None

        if not class_name:
            error = 'class name required'
        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                """
                    INSERT INTO class (class_name, class_code, student_id)
                    VALUES (?, ?, ?)
                """,
                (class_name, class_code, g.user['id'])
            )
            db.commit()
            return redirect(url_for('dashboard.dashboard'))
        
    return render_template('dashboard/create_class.html')

def get_class(id):
    db = get_db()
    class_entry = db.execute(
        """
        SELECT c.id, c.class_name, c.class_code, c.student_id, u.username
        FROM class c
        JOIN user u ON u.id = c.student_id
        WHERE c.id = ?
        """,
        (id,)
    ).fetchone()

    if class_entry is None:
        abort(404, f"Class id {id} doesn't exist.")

    return class_entry

@bp.route('/<int:id>/edit_class', methods=("GET", "POST"))
def edit_class(id):
    current_class = get_class(id)

    if request.method == 'POST':
        class_name = request.form['class_name']
        class_code = request.form['class_code']
        error = None

        if not class_name:
            error = 'class_name is required'
    
        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                """
                    UPDATE class SET class_name = ?, class_code = ?
                    WHERE id = ?
                """,
                (class_name, class_code, id)
            )
            db.commit()
            return redirect(url_for('dashboard.dashboard'))
    return render_template('dashboard/edit_class.html', current_class=current_class)