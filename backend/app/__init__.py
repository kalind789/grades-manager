import os
from flask import Flask
from datetime import timedelta
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from flask_cors import CORS


load_dotenv()
def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    CORS(app, origins=[
        "https://grades-manager.vercel.app",  # Production frontend
        "http://localhost:3000"               # Local development frontend
    ], supports_credentials=True)

    app.config.from_mapping(
        SECRET_KEY = 'dev',
        DATABASE = os.getenv('DATABASE_URL'),
        PERMANENT_SESSION_LIFETIME = timedelta(minutes=10),
        JWT_SECRET_KEY = "super-secret"
    )

    if test_config == None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)
    
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    jwt = JWTManager(app)

    @app.route('/hello')
    def hello():
        return 'Hello, World!'
    
    from . import db
    db.init_app(app)

    with app.app_context():
        db.init_db()
    
    from . import auth
    app.register_blueprint(auth.bp)
    
    from flask import render_template   
    @app.route('/')
    def index():
        return render_template('index.html')
    
    from . import dashboard
    app.register_blueprint(dashboard.bp)

    from . import manage_classes
    app.register_blueprint(manage_classes.bp)

    from . import section
    app.register_blueprint(section.bp)

    from . import assignment
    app.register_blueprint(assignment.bp)

    return app