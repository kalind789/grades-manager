from flask import (Blueprint, jsonify, request)
from app.db import get_db
from flask_jwt_extended import jwt_required

bp = Blueprint('section', __name__, url_prefix='/section')

# Return sections for a given class
@bp.route('/get_sections/<int:class_id>', methods=["GET"])
@jwt_required()
def get_sections(class_id):
    db = get_db()
    
    with db.cursor() as cursor:
        cursor.execute(
            """ 
            SELECT s.id, s.section_name, s.section_weight, s.section_grade
            FROM section s
            WHERE s.class_id = %s
            """,
            (class_id,),
        )
        columns = [desc[0] for desc in cursor.description]
        sections = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return jsonify({"sections": sections})


# Create a section for a given class
@bp.route('/create_section/<int:class_id>', methods=["POST"])
@jwt_required()
def create_sections(class_id):
    data = request.get_json()
    section_name = data.get('section_name')
    section_weight = data.get('section_weight')
    db = get_db()
    error = ""

    if not section_name:
        error = "Must enter section name"
    elif not section_weight:
        error = "Must enter section weight"

    if error:
        return jsonify({"error": error}), 400

    with db.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO section (section_name, section_weight, class_id)
            VALUES (%s, %s, %s)
            """,
            (section_name, section_weight, class_id),
        )
        db.commit()

    return jsonify({"message": "Section created successfully"}), 201


# Update a section
@bp.route('/<int:section_id>/edit', methods=["PUT"])
@jwt_required()
def edit_section(section_id):
    data = request.get_json()
    section_name = data.get('section_name')
    section_weight = data.get('section_weight')
    db = get_db()

    if not section_name or not section_weight:
        return jsonify({"error": "Missing required fields"}), 400

    with db.cursor() as cursor:
        cursor.execute(
            """
            UPDATE section
            SET section_name = %s, section_weight = %s
            WHERE id = %s
            """,
            (section_name, section_weight, section_id),
        )
        db.commit()

    return jsonify({"message": "Section updated successfully"}), 200


# Delete a section
@bp.route('/<int:section_id>/delete', methods=["DELETE"])
@jwt_required()
def delete_section(section_id):
    db = get_db()

    with db.cursor() as cursor:
        cursor.execute(
            """
            DELETE FROM section
            WHERE id = %s
            """,
            (section_id,)
        )
        db.commit()

    return jsonify({"message": "Section deleted successfully"}), 200


# Get a single section's details
@bp.route('/<int:section_id>', methods=["GET"])
@jwt_required()
def get_section(section_id):
    db = get_db()
    
    with db.cursor() as cursor:
        cursor.execute(
            """
            SELECT id, section_name, section_weight, section_grade, class_id
            FROM section
            WHERE id = %s
            """,
            (section_id,),
        )
        result = cursor.fetchone()
        if result is None:
            return jsonify({"error": "Section not found"}), 404

        column_names = ["id", "section_name", "section_weight", "section_grade", "class_id"]
        section = dict(zip(column_names, result))

    return jsonify({"section": section}), 200