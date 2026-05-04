from flask import Blueprint, jsonify, request
from app.db import get_db
from flask_jwt_extended import get_jwt_identity, jwt_required
from psycopg2 import Error

bp = Blueprint('section', __name__, url_prefix='/section')


def _verify_class_ownership(cursor, class_id, student_id):
    cursor.execute("SELECT student_id FROM class WHERE id = %s", (class_id,))
    row = cursor.fetchone()
    if not row:
        return False, jsonify({"error": "Class not found"}), 404
    if row[0] != student_id:
        return False, jsonify({"error": "Unauthorized"}), 403
    return True, None, None


def _verify_section_ownership(cursor, section_id, student_id):
    cursor.execute(
        """
        SELECT c.student_id, s.class_id
        FROM section s
        JOIN class c ON c.id = s.class_id
        WHERE s.id = %s
        """,
        (section_id,)
    )
    row = cursor.fetchone()
    if not row:
        return False, jsonify({"error": "Section not found"}), 404
    if row[0] != student_id:
        return False, jsonify({"error": "Unauthorized"}), 403
    return True, None, None


@bp.route('/get_sections/<int:class_id>', methods=["GET"])
@jwt_required()
def get_sections(class_id):
    db = get_db()
    student_id = get_jwt_identity()

    with db.cursor() as cursor:
        ok, err_resp, code = _verify_class_ownership(cursor, class_id, student_id)
        if not ok:
            return err_resp, code

        cursor.execute(
            """
            SELECT id, section_name, section_weight, section_grade
            FROM section
            WHERE class_id = %s
            """,
            (class_id,),
        )
        columns = [desc[0] for desc in cursor.description]
        sections = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify({"sections": sections})


@bp.route('/create_section/<int:class_id>', methods=["POST"])
@jwt_required()
def create_section(class_id):
    data = request.get_json()
    section_name = data.get('section_name', '').strip()
    section_weight = data.get('section_weight')
    student_id = get_jwt_identity()
    db = get_db()

    if not section_name:
        return jsonify({"error": "Section name is required"}), 400
    try:
        section_weight = float(section_weight)
    except (TypeError, ValueError):
        return jsonify({"error": "Section weight must be a number"}), 400
    if section_weight <= 0 or section_weight > 100:
        return jsonify({"error": "Section weight must be between 0 and 100"}), 400

    try:
        with db.cursor() as cursor:
            ok, err_resp, code = _verify_class_ownership(cursor, class_id, student_id)
            if not ok:
                return err_resp, code

            cursor.execute(
                """
                INSERT INTO section (section_name, section_weight, class_id)
                VALUES (%s, %s, %s)
                """,
                (section_name, section_weight, class_id),
            )
            db.commit()
    except Error as e:
        db.rollback()
        return jsonify({"error": "Failed to create section"}), 500

    return jsonify({"message": "Section created successfully"}), 201


@bp.route('/<int:section_id>/edit', methods=["PUT"])
@jwt_required()
def edit_section(section_id):
    data = request.get_json()
    section_name = data.get('section_name', '').strip()
    section_weight = data.get('section_weight')
    student_id = get_jwt_identity()
    db = get_db()

    if not section_name:
        return jsonify({"error": "Section name is required"}), 400
    try:
        section_weight = float(section_weight)
    except (TypeError, ValueError):
        return jsonify({"error": "Section weight must be a number"}), 400
    if section_weight <= 0 or section_weight > 100:
        return jsonify({"error": "Section weight must be between 0 and 100"}), 400

    try:
        with db.cursor() as cursor:
            ok, err_resp, code = _verify_section_ownership(cursor, section_id, student_id)
            if not ok:
                return err_resp, code

            cursor.execute(
                """
                UPDATE section
                SET section_name = %s, section_weight = %s
                WHERE id = %s
                """,
                (section_name, section_weight, section_id),
            )
            db.commit()
    except Error as e:
        db.rollback()
        return jsonify({"error": "Failed to update section"}), 500

    return jsonify({"message": "Section updated successfully"}), 200


@bp.route('/<int:section_id>/delete', methods=["DELETE"])
@jwt_required()
def delete_section(section_id):
    student_id = get_jwt_identity()
    db = get_db()

    try:
        with db.cursor() as cursor:
            ok, err_resp, code = _verify_section_ownership(cursor, section_id, student_id)
            if not ok:
                return err_resp, code

            # Get class_id before deleting so we can recalculate class grade
            cursor.execute("SELECT class_id FROM section WHERE id = %s", (section_id,))
            class_id = cursor.fetchone()[0]

            cursor.execute("DELETE FROM section WHERE id = %s", (section_id,))

            # Recalculate class grade after section removal
            cursor.execute(
                """
                SELECT SUM(section_grade * section_weight), SUM(section_weight)
                FROM section
                WHERE class_id = %s AND section_grade IS NOT NULL
                """,
                (class_id,)
            )
            result = cursor.fetchone()
            total_weighted, total_weight = result
            class_grade = (total_weighted / total_weight) if total_weight else None
            cursor.execute(
                "UPDATE class SET class_grade = %s WHERE id = %s",
                (class_grade, class_id)
            )

            db.commit()
    except Error as e:
        db.rollback()
        return jsonify({"error": "Failed to delete section"}), 500

    return jsonify({"message": "Section deleted successfully"}), 200


@bp.route('/<int:section_id>', methods=["GET"])
@jwt_required()
def get_section(section_id):
    student_id = get_jwt_identity()
    db = get_db()

    with db.cursor() as cursor:
        ok, err_resp, code = _verify_section_ownership(cursor, section_id, student_id)
        if not ok:
            return err_resp, code

        cursor.execute(
            """
            SELECT id, section_name, section_weight, section_grade, class_id
            FROM section
            WHERE id = %s
            """,
            (section_id,),
        )
        result = cursor.fetchone()
        columns = ["id", "section_name", "section_weight", "section_grade", "class_id"]
        section = dict(zip(columns, result))

    return jsonify({"section": section}), 200
