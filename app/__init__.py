import os
from flask import Flask
from datetime import timedelta

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY = 'dev',
        DATABASE = os.path.join(app.instance_path, 'app.sqlite'),
        PERMANENT_SESSION_LIFETIME = timedelta(minutes=10)
    )

    if test_config == None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)
    
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/hello')
    def hello():
        return 'Hello, World!'
    
    from . import db
    db.init_app(app)
    
    from . import auth
    app.register_blueprint(auth.bp)
    
    from flask import render_template   
    @app.route('/')
    def index():
        return render_template('index.html')
    
    from . import dashboard
    app.register_blueprint(dashboard.bp)

    return app