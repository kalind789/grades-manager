from flask import Blueprint, jsonify
from app.db import get_db
from flask_jwt_extended import jwt_required

bp = Blueprint('manage_classes', __name__, url_prefix='/manage_classes')

@bp.route('/manage_class/<int:class_id>', methods=["GET"])
@jwt_required()
def manage_class(class_id):
    db = get_db()
    with db.cursor() as cursor:
        # Fetch class info
        cursor.execute(
            """
            SELECT id, class_name, class_grade
            FROM class
            WHERE id = %s
            """,
            (class_id,)
        )
        class_row = cursor.fetchone()
        if not class_row:
            return jsonify({"error": "Class not found"}), 404

        class_info = {
            "id": class_row[0],
            "class_name": class_row[1],
            "class_grade": class_row[2],
        }

        # Fetch sections with assignments
        cursor.execute(
            """
            SELECT id, section_name, section_weight, section_grade
            FROM section
            WHERE class_id = %s
            """,
            (class_id,)
        )
        sections = []
        for section_row in cursor.fetchall():
            section_id, section_name, section_weight, section_grade = section_row

            cursor.execute(
                """
                SELECT id, assignment_name, points_received, points_possible
                FROM assignment
                WHERE section_id = %s
                """,
                (section_id,)
            )
            assignments = [
                {
                    "id": a[0],
                    "assignment_name": a[1],
                    "points_received": a[2],
                    "points_possible": a[3],
                }
                for a in cursor.fetchall()
            ]

            sections.append({
                "id": section_id,
                "section_name": section_name,
                "section_weight": section_weight,
                "section_grade": section_grade,
                "assignments": assignments,
            })

    return jsonify({
        "class": class_info,
        "sections": sections,
    }), 200