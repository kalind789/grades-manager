from flask import Blueprint, request, jsonify
from app.db import get_db
from flask_jwt_extended import get_jwt_identity, jwt_required
from psycopg2 import Error

bp = Blueprint('assignment', __name__, url_prefix='/assignment')


def _verify_section_ownership(cursor, section_id, student_id):
    cursor.execute(
        """
        SELECT c.student_id
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


def _verify_assignment_ownership(cursor, assignment_id, student_id):
    cursor.execute(
        """
        SELECT c.student_id, a.section_id
        FROM assignment a
        JOIN section s ON s.id = a.section_id
        JOIN class c ON c.id = s.class_id
        WHERE a.id = %s
        """,
        (assignment_id,)
    )
    row = cursor.fetchone()
    if not row:
        return False, None, jsonify({"error": "Assignment not found"}), 404
    if row[0] != student_id:
        return False, None, jsonify({"error": "Unauthorized"}), 403
    return True, row[1], None, None


def _recalculate_grades(cursor, section_id):
    """Recalculate section grade and parent class grade within the current transaction."""
    cursor.execute(
        """
        SELECT SUM(points_received), SUM(points_possible)
        FROM assignment
        WHERE section_id = %s
        """,
        (section_id,)
    )
    total_received, total_possible = cursor.fetchone()
    section_grade = (total_received / total_possible) * 100 if total_possible else 0

    cursor.execute(
        "UPDATE section SET section_grade = %s WHERE id = %s",
        (section_grade, section_id)
    )

    cursor.execute("SELECT class_id FROM section WHERE id = %s", (section_id,))
    class_id = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT SUM(section_grade * section_weight), SUM(section_weight)
        FROM section
        WHERE class_id = %s AND section_grade IS NOT NULL
        """,
        (class_id,)
    )
    total_weighted, total_weight = cursor.fetchone()
    class_grade = (total_weighted / total_weight) if total_weight else None

    cursor.execute(
        "UPDATE class SET class_grade = %s WHERE id = %s",
        (class_grade, class_id)
    )


@bp.route('/create/<int:section_id>', methods=["POST"])
@jwt_required()
def create_assignment(section_id):
    data = request.get_json()
    assignment_name = data.get("assignment_name", "").strip()
    points_received = data.get("points_received")
    points_possible = data.get("points_possible")
    student_id = get_jwt_identity()
    db = get_db()

    if not assignment_name:
        return jsonify({"error": "Assignment name is required"}), 400
    try:
        points_received = float(points_received)
        points_possible = float(points_possible)
    except (TypeError, ValueError):
        return jsonify({"error": "Points must be numbers"}), 400
    if points_possible <= 0:
        return jsonify({"error": "Points possible must be greater than 0"}), 400
    if points_received < 0:
        return jsonify({"error": "Points received cannot be negative"}), 400

    try:
        with db.cursor() as cursor:
            ok, err_resp, code = _verify_section_ownership(cursor, section_id, student_id)
            if not ok:
                return err_resp, code

            cursor.execute(
                """
                INSERT INTO assignment (assignment_name, points_received, points_possible, section_id)
                VALUES (%s, %s, %s, %s)
                """,
                (assignment_name, points_received, points_possible, section_id),
            )
            _recalculate_grades(cursor, section_id)
            db.commit()
    except Error as e:
        db.rollback()
        return jsonify({"error": "Failed to create assignment"}), 500

    return jsonify({"message": "Assignment created successfully"}), 201


@bp.route('/<int:assignment_id>/edit', methods=["PUT"])
@jwt_required()
def edit_assignment(assignment_id):
    data = request.get_json()
    assignment_name = data.get("assignment_name", "").strip()
    points_received = data.get("points_received")
    points_possible = data.get("points_possible")
    student_id = get_jwt_identity()
    db = get_db()

    if not assignment_name:
        return jsonify({"error": "Assignment name is required"}), 400
    try:
        points_received = float(points_received)
        points_possible = float(points_possible)
    except (TypeError, ValueError):
        return jsonify({"error": "Points must be numbers"}), 400
    if points_possible <= 0:
        return jsonify({"error": "Points possible must be greater than 0"}), 400
    if points_received < 0:
        return jsonify({"error": "Points received cannot be negative"}), 400

    try:
        with db.cursor() as cursor:
            ok, section_id, err_resp, code = _verify_assignment_ownership(cursor, assignment_id, student_id)
            if not ok:
                return err_resp, code

            cursor.execute(
                """
                UPDATE assignment
                SET assignment_name = %s, points_received = %s, points_possible = %s
                WHERE id = %s
                """,
                (assignment_name, points_received, points_possible, assignment_id),
            )
            _recalculate_grades(cursor, section_id)
            db.commit()
    except Error as e:
        db.rollback()
        return jsonify({"error": "Failed to update assignment"}), 500

    return jsonify({"message": "Assignment updated successfully"}), 200


@bp.route('/<int:assignment_id>/delete', methods=["DELETE"])
@jwt_required()
def delete_assignment(assignment_id):
    student_id = get_jwt_identity()
    db = get_db()

    try:
        with db.cursor() as cursor:
            ok, section_id, err_resp, code = _verify_assignment_ownership(cursor, assignment_id, student_id)
            if not ok:
                return err_resp, code

            cursor.execute("DELETE FROM assignment WHERE id = %s", (assignment_id,))

            # Check if section still has assignments before recalculating
            cursor.execute(
                "SELECT COUNT(*) FROM assignment WHERE section_id = %s",
                (section_id,)
            )
            remaining = cursor.fetchone()[0]
            if remaining > 0:
                _recalculate_grades(cursor, section_id)
            else:
                # No assignments left; clear section grade and recalculate class grade
                cursor.execute(
                    "UPDATE section SET section_grade = NULL WHERE id = %s",
                    (section_id,)
                )
                cursor.execute("SELECT class_id FROM section WHERE id = %s", (section_id,))
                class_id = cursor.fetchone()[0]
                cursor.execute(
                    """
                    SELECT SUM(section_grade * section_weight), SUM(section_weight)
                    FROM section
                    WHERE class_id = %s AND section_grade IS NOT NULL
                    """,
                    (class_id,)
                )
                total_weighted, total_weight = cursor.fetchone()
                class_grade = (total_weighted / total_weight) if total_weight else None
                cursor.execute(
                    "UPDATE class SET class_grade = %s WHERE id = %s",
                    (class_grade, class_id)
                )

            db.commit()
    except Error as e:
        db.rollback()
        return jsonify({"error": "Failed to delete assignment"}), 500

    return jsonify({"message": "Assignment deleted successfully"}), 200


@bp.route('/section/<int:section_id>/assignments', methods=["GET"])
@jwt_required()
def view_assignments(section_id):
    student_id = get_jwt_identity()
    db = get_db()

    with db.cursor() as cursor:
        ok, err_resp, code = _verify_section_ownership(cursor, section_id, student_id)
        if not ok:
            return err_resp, code

        cursor.execute(
            """
            SELECT id, assignment_name, points_received, points_possible
            FROM assignment
            WHERE section_id = %s
            ORDER BY id
            """,
            (section_id,)
        )
        columns = [desc[0] for desc in cursor.description]
        assignments = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify({"assignments": assignments}), 200
