from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for)
from app.auth import login_required
from app.db import get_db
from app.section import get_sections, create_sections

bp = Blueprint('manage_classes', __name__, url_prefix='/manage_classes')

@bp.route('/manage_class/<int:class_id>', methods=("GET", "POST"))
@login_required
def manage_class(class_id):
    db = get_db()
    sections = get_sections(class_id)  # ✅ Correct way to fetch sections

    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, class_name FROM class
            WHERE id = %s
            """,
            (class_id,)
        )
        columns = [desc[0] for desc in cursor.description]
        class_ = dict(zip(columns, cursor.fetchone()))

    return render_template('manage_class/manage_class.html', sections=sections, class_=class_)