from flask import (Blueprint, flash, g, redirect, render_template, request, session, url_for)
from db import get_db

bp = Blueprint('assignment', __name__, url_prefix='/assignment')

@bp.route('/get_assignments', methods=("GET", "POST"))
def get_assignments():
    db = get_db()
    assignments = db.execute(
        """
            SELECT 
        """
    )