from flask import Blueprint, jsonify
from app.db import get_db
from flask_jwt_extended import jwt_required

bp = Blueprint('manage_classes', __name__, url_prefix='/manage_classes')

@bp.route('/manage_class/<int:class_id>', methods=["GET"])
@jwt_required()
def manage_class(class_id):
    db = get_db()
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, class_name
            FROM class
            WHERE id = %s
            """,
            (class_id,)
        )
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Class not found"}), 404
        columns = [desc[0] for desc in cursor.description]
        class_ = dict(zip(columns, result))

        cursor.execute(
            """
            SELECT id, section_name, section_weight, section_grade
            FROM section
            WHERE class_id = %s
            """,
            (class_id,)
        )
        section_columns = [desc[0] for desc in cursor.description]
        sections = [dict(zip(section_columns, row)) for row in cursor.fetchall()]

    return jsonify({
        "class": class_,
        "sections": sections
    }), 200