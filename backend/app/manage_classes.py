from flask import Blueprint, jsonify
from app.db import get_db
from flask_jwt_extended import get_jwt_identity, jwt_required

bp = Blueprint('manage_classes', __name__, url_prefix='/manage_classes')


@bp.route('/manage_class/<int:class_id>', methods=["GET"])
@jwt_required()
def manage_class(class_id):
    db = get_db()
    student_id = get_jwt_identity()

    with db.cursor() as cursor:
        cursor.execute(
            "SELECT id, class_name, class_code, class_grade, student_id FROM class WHERE id = %s",
            (class_id,)
        )
        class_row = cursor.fetchone()
        if not class_row:
            return jsonify({"error": "Class not found"}), 404
        if class_row[4] != student_id:
            return jsonify({"error": "Unauthorized"}), 403

        class_info = {
            "id": class_row[0],
            "class_name": class_row[1],
            "class_code": class_row[2],
            "class_grade": class_row[3],
        }

        # Single JOIN query instead of N+1 queries
        cursor.execute(
            """
            SELECT
                s.id AS section_id,
                s.section_name,
                s.section_weight,
                s.section_grade,
                a.id AS assignment_id,
                a.assignment_name,
                a.points_received,
                a.points_possible
            FROM section s
            LEFT JOIN assignment a ON a.section_id = s.id
            WHERE s.class_id = %s
            ORDER BY s.id, a.id
            """,
            (class_id,)
        )
        rows = cursor.fetchall()

    # Reconstruct nested structure from flat JOIN result
    sections_map = {}
    for row in rows:
        s_id, s_name, s_weight, s_grade, a_id, a_name, a_recv, a_poss = row
        if s_id not in sections_map:
            sections_map[s_id] = {
                "id": s_id,
                "section_name": s_name,
                "section_weight": s_weight,
                "section_grade": s_grade,
                "assignments": [],
            }
        if a_id is not None:
            sections_map[s_id]["assignments"].append({
                "id": a_id,
                "assignment_name": a_name,
                "points_received": a_recv,
                "points_possible": a_poss,
            })

    return jsonify({
        "class": class_info,
        "sections": list(sections_map.values()),
    }), 200
