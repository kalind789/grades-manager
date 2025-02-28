import sqlite3
from datetime import datetime
import click
from flask import current_app, g
import psycopg2
import os
from psycopg2 import sql

def get_db():
    """
        Return the database
        Create a database if one does not exist
        g: global variable to store information about each request
        current_app: flask app that the request is running on
    """
    if 'db' not in g:
        DATABASE_URL = os.getenv('DATABASE_URL')
        g.db = psycopg2.connect(DATABASE_URL, sslmode="require")

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
    cursor = db.cursor()

    cursor.execute("SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'student');")
    exists = cursor.fetchone()[0]
    if exists:
        return

    with current_app.open_resource('schema.sql') as f:
        sql_script = f.read().decode('utf-8')
    
    statements = sql_script.split(';')
    for statement in statements:
        if statement.strip():
            cursor.execute(statement)
    
    db.commit()

@click.command('init-db')
def init_db_command():
    """
        Clear the existing data and create new tables
    """
    init_db()
    click.echo("Intialized the database")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
