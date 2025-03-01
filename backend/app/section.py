from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify)
from app.auth import login_required
from app.db import get_db

bp = Blueprint('section', __name__, url_prefix='/section')

@bp.route('/get_sections/<int:class_id>', methods=["GET", "POST"])
def get_sections(class_id):
    db = get_db()
    
    with db.cursor() as cursor:
        cursor.execute(
            """ 
            SELECT s.id, s.section_name, s.section_weight
            FROM section s
            WHERE s.class_id = %s
            """,
            (class_id,),
        )
        columns = [desc[0] for desc in cursor.description]
        sections = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify({"sections": sections})  # ✅ Return a JSON response


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
            return render_template('manage_class/create_section.html')

        with db.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO section (section_name, section_weight, class_id)
                VALUES (%s, %s, %s)
                """,
                (section_name, section_weight, class_id),
            )
            db.commit()  # ✅ Commit the database changes

        return redirect(url_for('manage_classes.manage_class', class_id=class_id))

    return render_template('manage_class/create_section.html', class_id=class_id)