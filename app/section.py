from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify
)
from werkzeug.exceptions import abort
from app.auth import login_required
from app.db import get_db

bp = Blueprint('section', __name__, url_prefix='/section')

@bp.route('/<int:class_id>', methods=["GET"])
@login_required
def get_sections(class_id):
    db = get_db()
    sections = db.execute(
        """
        SELECT id, section_name, section_code 
        FROM section
        WHERE class_id = ?
        ORDER BY id DESC
        """,
        (class_id,),
    ).fetchall()

    sections_list = [dict(section) for section in sections]
    return jsonify({"sections": sections_list})

@bp.route('/create_section', methods=["GET"])
@login_required
def create_section():
    data = request.get_json()

    section_name = data.get('section_name')
    section_weight = int(data.get('section_weight')) / 100
    class_id = data.get('class_id')
    
    db = get_db()
    sections = db.execute(
        """
            INSERT INTO section (section_name, section_weight, class_id)
            VALUES (?, ?, ?)
        """,
        (section_name, section_weight, class_id,),
    ).fetchall()

    sections_list = [dict(section) for section in sections]
    return jsonify({"sections": sections_list})


@bp.route('/<int:id>/edit_section', methods=["GET", "POST"])
@login_required
def edit_section(id):
    db = get_db()
    current_section = db.execute(
        "SELECT * FROM section WHERE id = ? AND student_id = ?",
        (id, g.user["id"]),
    ).fetchone()

    if current_section is None:
        abort(404, f"Section ID {id} not found.")

    if request.method == "POST":
        section_name = request.form["section_name"]
        section_code = request.form["section_code"]
        error = None

        if not section_name:
            error = "Section name is required."

        if error:
            flash(error, "error")
        else:
            db.execute(
                """
                UPDATE section 
                SET section_name = ?, section_code = ?
                WHERE id = ? AND student_id = ?
                """,
                (section_name, section_code, id, g.user["id"]),
            )
            db.commit()
            flash("Section updated successfully!", "success")
            return redirect(url_for("section.get_sections"))

    return render_template("section/edit_section.html", current_section=current_section)

@bp.route('/<int:id>/delete_section', methods=["POST"])
@login_required
def delete_section(id):
    db = get_db()
    section = db.execute(
        "SELECT * FROM section WHERE id = ? AND student_id = ?",
        (id, g.user["id"]),
    ).fetchone()

    if section is None:
        abort(404, f"Section ID {id} not found.")

    db.execute("DELETE FROM section WHERE id = ?", (id,))
    db.commit()
    flash("Section deleted successfully!", "success")

    return redirect(url_for("section.get_sections"))