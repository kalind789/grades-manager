import sqlite3
from datetime import datetime
import click
from flask import current_app, g

def get_db():
    """
        Return the database
        Create a database if one does not exist
        g: global variable to store information about each request
        current_app: flask app that the request is running on
    """
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    """
        Pops the database from the global variable
        Closes the database instance if it exists
    """
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    """
        Intializes the database with the scripts present in schema.sql
    """
    db = get_db()

    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))

@click.command('init-db')
def init_db_command():
    """
        Clear the existing data and create new tables
    """
    init_db()
    click.echo("Intialized the database")

@click.command('add-class')
def add_class_command():
    db = get_db()
    db.execute(
        """
            INSERT INTO class (class_name, class_code, student_id) 
            VALUES (?, ?, ?)
        """,
        ('Intro to Computer Science', 'CSC 171', 1)
    )
    db.commit()
    click.echo('Added class!')

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(add_class_command)