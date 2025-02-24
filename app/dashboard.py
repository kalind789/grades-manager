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
        """,
        (g.user['id'],),
    ).fetchall()
    return render_template('dashboard/dashboard.html', classes = classes)