from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from config import Config
from routes import bp as api_bp
import os

mongo = PyMongo()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)
    mongo.init_app(app)
    jwt.init_app(app)
    app.config['MONGO'] = mongo

    # Ensure index for student practices chat
    with app.app_context():
        mongo.db.student_practices.create_index(
            [('practice_id', 1), ('student_email', 1)],
            unique=True
        )

    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_folder

    @app.route('/uploads/<path:path>')
    def uploaded_file(path):
        return send_from_directory(upload_folder, path)

    app.register_blueprint(api_bp, url_prefix='/api')
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)
