from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify)
from app.auth import login_required
from app.db import get_db

bp = Blueprint('section', __name__, url_prefix='/section')

@bp.route('/get_sections/<int:class_id>', methods=["GET", "POST"])
def get_sections(class_id):
    sections = get_db().execute(
        """ 
        SELECT s.id, s.section_name, s.section_weight
        FROM section s
        WHERE s.class_id = ?
        """,
        (class_id,),
    ).fetchall()  # ✅ Added fetchall()

    sections_list = [dict(section) for section in sections]
    return sections_list  # ✅ This now returns a proper list

@bp.route('/create_section/<int:class_id>', methods=["GET", "POST"])
def create_sections(class_id):
    if request.method == "POST":
        section_name = request.form['section_name']
        section_weight = request.form['section_weight']
        db = get_db()
        error = ""

        if not section_name:
            error = "Must enter section name"
        elif not section_weight:
            error = "Must enter section weight"

        if error:
            flash(error)
            return render_template('manage_class/create_section.html')  # ✅ Fixed extra slash

        db.execute(
            """
            INSERT INTO section (section_name, section_weight, class_id)
            VALUES (?, ?, ?)
            """,
            (section_name, section_weight, class_id),
        )
        db.commit()  # ✅ Commit the database changes

        return redirect(url_for('manage_classes.manage_class', class_id=class_id))  # ✅ Fixed redirect

    return render_template('manage_class/create_section.html')  # ✅ Fixed extra slash