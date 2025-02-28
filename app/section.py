from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify)
from app.auth import login_required
from app.db import get_db

bp = Blueprint('section', __name__, url_prefix='/section')

@bp.route('/get_sections', methods=("GET", "POST"))
def get_sections(class_id):
    sections = get_db().execute(
        """ 
            SELECT s.id, s.section_name, s.section_weight
            FROM section s
            WHERE s.class_id = ?
        """,
        (class_id,),
    )
    
    sections_list = [dict(section) for section in sections]
    # return jsonify({"sections": sections_list})
    return sections_list

@bp.route('/create_section', methods=("GET", "POST"))
def create_sections(class_id):
    pass