from flask import Blueprint, request, jsonify
from app.db import get_db
from flask_jwt_extended import get_jwt_identity, jwt_required

bp = Blueprint('assignment', __name__, url_prefix='/assignment')


def update_section_grade(section_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT SUM(points_received), SUM(points_possible)
            FROM assignment
            WHERE section_id = %s
            """,
            (section_id,)
        )
        result = cursor.fetchone()
        total_received, total_possible = result
        section_grade = (total_received / total_possible) * 100 if total_possible else 0
        cursor.execute(
            """
            UPDATE section
            SET section_grade = %s
            WHERE id = %s
            """,
            (section_grade, section_id)
        )
        db.commit()


def update_class_grade(class_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT SUM(section_grade * section_weight), SUM(section_weight)
            FROM section
            WHERE class_id = %s
            """,
            (class_id,)
        )
        result = cursor.fetchone()
        total_weighted, total_weight = result
        class_grade = (total_weighted / total_weight) if total_weight else 0
        cursor.execute(
            """
            UPDATE class
            SET class_grade = %s
            WHERE id = %s
            """,
            (class_grade, class_id)
        )
        db.commit()


@bp.route('/create/<int:section_id>', methods=["POST"])
@jwt_required()
def create_assignment(section_id):
    data = request.get_json()
    assignment_name = data.get("assignment_name")
    points_received = data.get("points_received")
    points_possible = data.get("points_possible")
    db = get_db()

    if not assignment_name or points_received is None or points_possible is None:
        return jsonify({"error": "Missing required fields"}), 400

    with db.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO assignment (assignment_name, points_received, points_possible, section_id)
            VALUES (%s, %s, %s, %s)
            """,
            (assignment_name, points_received, points_possible, section_id),
        )
        db.commit()

    update_section_grade(section_id)

    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT class_id
            FROM section
            WHERE id = %s
            """,
            (section_id,)
        )
        class_id = cursor.fetchone()[0]

    update_class_grade(class_id)

    return jsonify({"message": "Assignment created successfully"}), 201


@bp.route('/<int:assignment_id>/edit', methods=["PUT"])
@jwt_required()
def edit_assignment(assignment_id):
    data = request.get_json()
    assignment_name = data.get("assignment_name")
    points_received = data.get("points_received")
    points_possible = data.get("points_possible")
    db = get_db()

    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT section_id
            FROM assignment
            WHERE id = %s
            """,
            (assignment_id,)
        )
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Assignment not found"}), 404
        section_id = result[0]

    with db.cursor() as cursor:
        cursor.execute(
            """
            UPDATE assignment
            SET assignment_name = %s, points_received = %s, points_possible = %s
            WHERE id = %s
            """,
            (assignment_name, points_received, points_possible, assignment_id),
        )
        db.commit()

    update_section_grade(section_id)

    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT class_id
            FROM section
            WHERE id = %s
            """,
            (section_id,)
        )
        class_id = cursor.fetchone()[0]

    update_class_grade(class_id)

    return jsonify({"message": "Assignment updated successfully"}), 200


@bp.route('/<int:assignment_id>/delete', methods=["DELETE"])
@jwt_required()
def delete_assignment(assignment_id):
    db = get_db()

    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT section_id
            FROM assignment
            WHERE id = %s
            """,
            (assignment_id,)
        )
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Assignment not found"}), 404
        section_id = result[0]

    with db.cursor() as cursor:
        cursor.execute(
            """
            DELETE FROM assignment
            WHERE id = %s
            """,
            (assignment_id,)
        )
        db.commit()

    update_section_grade(section_id)

    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT class_id
            FROM section
            WHERE id = %s
            """,
            (section_id,)
        )
        class_id = cursor.fetchone()[0]

    update_class_grade(class_id)

    return jsonify({"message": "Assignment deleted successfully"}), 200


@bp.route('/section/<int:section_id>/assignments', methods=["GET"])
@jwt_required()
def view_assignments(section_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, assignment_name, points_received, points_possible
            FROM assignment
            WHERE section_id = %s
            """,
            (section_id,)
        )
        columns = [desc[0] for desc in cursor.description]
        assignments = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify({"assignments": assignments}), 200
