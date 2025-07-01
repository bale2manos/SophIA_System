from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from .config import Config
from .routes import bp as api_bp

mongo = PyMongo()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    mongo.init_app(app)
    app.config['MONGO'] = mongo
    app.register_blueprint(api_bp, url_prefix='/api')
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
