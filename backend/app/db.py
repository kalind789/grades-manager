import click
from flask import current_app, g
import psycopg2
import os


def get_db():
    if 'db' not in g:
        DATABASE_URL = os.getenv('DATABASE_URL')
        g.db = psycopg2.connect(DATABASE_URL, sslmode="require")
    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
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
    init_db()
    click.echo("Initialized the database")


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
