from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, current_app
)
from werkzeug.exceptions import abort
from app.auth import login_required
from app.db import get_db

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")

@bp.route("/", methods=("GET", "POST"))
@login_required
def dashboard():
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT c.id, c.class_name, c.class_code, c.student_id 
            FROM class c
            WHERE c.student_id = %s
            ORDER BY c.id DESC
            """,
            (g.student["id"],),
        )
        columns = [desc[0] for desc in cursor.description]
        classes = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return render_template("dashboard/dashboard.html", classes=classes)

@bp.route("/create_class", methods=("GET", "POST"))
@login_required
def create_class():
    if request.method == "POST":
        class_name = request.form.get("class_name")
        class_code = request.form.get("class_code")
        error = "Class name is required" if not class_name else None

        if error:
            flash(error)
        else:
            db = get_db()
            with db.cursor() as cursor:
                try:
                    cursor.execute(
                        """
                        INSERT INTO class (class_name, class_code, student_id)
                        VALUES (%s, %s, %s)
                        """,
                        (class_name, class_code, g.student["id"]),
                    )
                    db.commit()
                except Exception as e:
                    db.rollback()
                    current_app.logger.error(f"Error creating class: {e}")
                    flash("Error creating class. Please try again.")

            return redirect(url_for("dashboard.dashboard"))

    return render_template("dashboard/create_class.html")

def get_class(class_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT c.id, c.class_name, c.class_code, c.student_id, s.studentname
            FROM class c
            JOIN student s ON s.id = c.student_id
            WHERE c.id = %s
            """,
            (class_id,),
        )
        row = cursor.fetchone()

    if row is None:
        abort(404, f"Class id {class_id} doesn't exist.")

    column_names = ["id", "class_name", "class_code", "student_id", "studentname"]
    return dict(zip(column_names, row))

@bp.route("/<int:id>/edit_class", methods=("GET", "POST"))
@login_required
def edit_class(id):
    current_class = get_class(id)

    if g.student["id"] != current_class["student_id"]:
        flash("You are not authorized to edit this class.")
        return redirect(url_for("dashboard.dashboard"))

    if request.method == "POST":
        class_name = request.form.get("class_name")
        class_code = request.form.get("class_code")
        error = "Class name is required" if not class_name else None

        if error:
            flash(error)
        else:
            db = get_db()
            with db.cursor() as cursor:
                try:
                    cursor.execute(
                        """
                        UPDATE class SET class_name = %s, class_code = %s
                        WHERE id = %s
                        """,
                        (class_name, class_code, id),
                    )
                    db.commit()
                except Exception as e:
                    db.rollback()
                    current_app.logger.error(f"Error updating class: {e}")
                    flash("Error updating class. Please try again.")

            return redirect(url_for("dashboard.dashboard"))

    return render_template("dashboard/edit_class.html", current_class=current_class)

@bp.route("/<int:id>/delete_class", methods=("POST",))
@login_required
def delete_class(id):
    current_class = get_class(id)

    if g.student["id"] != current_class["student_id"]:
        flash("You are not authorized to delete this class.")
        return redirect(url_for("dashboard.dashboard"))

    db = get_db()
    with db.cursor() as cursor:
        try:
            cursor.execute("DELETE FROM class WHERE id = %s", (id,))
            db.commit()
            flash("Class deleted successfully.")
        except Exception as e:
            db.rollback()
            current_app.logger.error(f"Error deleting class: {e}")
            flash("Error deleting class. Please try again.")

    return redirect(url_for("dashboard.dashboard"))