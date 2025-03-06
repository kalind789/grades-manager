from flask import Blueprint, jsonify, current_app, request
from app.db import get_db
from flask_jwt_extended import get_jwt_identity, jwt_required
from psycopg2 import Error

bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@bp.route("/", methods=["GET"])
@jwt_required()
def dashboard():
    db = get_db()
    cursor = db.cursor()
    studentname = get_jwt_identity()

    try:
        cursor.execute(
            "SELECT id FROM student WHERE studentname = %s",
            (studentname,)
        )
        student = cursor.fetchone()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        student_id = student[0]

        cursor.execute(
            """
            SELECT c.id, c.class_name, c.class_code, c.student_id 
            FROM class c
            WHERE c.student_id = %s
            ORDER BY c.id DESC
            """,
            (student_id,),
        )
        columns = [desc[0] for desc in cursor.description]
        classes = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return jsonify({"classes": classes}), 200

    except Error as e:
        current_app.logger.error(f"Error fetching dashboard: {e}")
        return jsonify({"error": "Failed to load dashboard"}), 500


@bp.route("/create_class", methods=["POST"])
@jwt_required()
def create_class():
    db = get_db()
    cursor = db.cursor()
    studentname = get_jwt_identity()
    data = request.get_json()
    class_name = data.get("class_name")
    class_code = data.get("class_code")

    if not class_name:
        return jsonify({"error": "Class name is required"}), 400

    try:
        cursor.execute(
            "SELECT id FROM student WHERE studentname = %s",
            (studentname,)
        )
        student = cursor.fetchone()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        student_id = student[0]

        cursor.execute(
            """
            INSERT INTO class (class_name, class_code, student_id)
            VALUES (%s, %s, %s)
            """,
            (class_name, class_code, student_id),
        )
        db.commit()
        return jsonify({"message": "Class created successfully"}), 201

    except Error as e:
        db.rollback()
        current_app.logger.error(f"Error creating class: {e}")
        return jsonify({"error": "Failed to create class"}), 500


@bp.route("/<int:id>/edit_class", methods=["PUT"])
@jwt_required()
def edit_class(id):
    db = get_db()
    cursor = db.cursor()
    studentname = get_jwt_identity()
    data = current_app.request.get_json()
    class_name = data.get("class_name")
    class_code = data.get("class_code")

    if not class_name:
        return jsonify({"error": "Class name is required"}), 400

    try:
        cursor.execute(
            "SELECT id FROM student WHERE studentname = %s",
            (studentname,)
        )
        student = cursor.fetchone()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        student_id = student[0]

        cursor.execute(
            "SELECT student_id FROM class WHERE id = %s",
            (id,)
        )
        class_owner = cursor.fetchone()
        if not class_owner or class_owner[0] != student_id:
            return jsonify({"error": "Unauthorized"}), 403

        cursor.execute(
            """
            UPDATE class
            SET class_name = %s, class_code = %s
            WHERE id = %s
            """,
            (class_name, class_code, id),
        )
        db.commit()
        return jsonify({"message": "Class updated successfully"}), 200

    except Error as e:
        db.rollback()
        current_app.logger.error(f"Error updating class: {e}")
        return jsonify({"error": "Failed to update class"}), 500


@bp.route("/<int:id>/delete_class", methods=["DELETE"])
@jwt_required()
def delete_class(id):
    db = get_db()
    cursor = db.cursor()
    studentname = get_jwt_identity()

    try:
        cursor.execute(
            "SELECT id FROM student WHERE studentname = %s",
            (studentname,)
        )
        student = cursor.fetchone()
        if not student:
            return jsonify({"error": "Student not found"}), 404

        student_id = student[0]

        cursor.execute(
            "SELECT student_id FROM class WHERE id = %s",
            (id,)
        )
        class_owner = cursor.fetchone()
        if not class_owner or class_owner[0] != student_id:
            return jsonify({"error": "Unauthorized"}), 403

        cursor.execute(
            "DELETE FROM class WHERE id = %s",
            (id,)
        )
        db.commit()
        return jsonify({"message": "Class deleted successfully"}), 200

    except Error as e:
        db.rollback()
        current_app.logger.error(f"Error deleting class: {e}")
        return jsonify({"error": "Failed to delete class"}), 500
