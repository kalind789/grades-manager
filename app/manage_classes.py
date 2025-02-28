from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for)
from app.auth import login_required
from app.db import get_db
from app.section import get_sections

bp = Blueprint('manage_classes', __name__, url_prefix='/manage_classes')

@bp.route('/manage_classes/<int:class_id>', methods=("GET", "POST"))
@login_required
def manage_classes(class_id):
    sections = get_sections(class_id)

    class_name = get_db().execute(
        """
            SELECT class_name FROM class
            WHERE id = ?
        """,
        (class_id,)
    ).fetchone()['class_name']

    return render_template('manage_class/manage_class.html', sections=sections, class_name=class_name)