from flask import jsonify
from flask_pymongo import PyMongo
from bson import ObjectId
from . import bp
from ..models.subject import Subject
from flask import current_app


def get_db():
    return current_app.config['MONGO']

@bp.route('/subjects', methods=['GET'])
def list_subjects():
    mongo = get_db()
    subjects = mongo.db.subjects.find()
    data = [Subject.from_dict(s).to_dict() | {'_id': str(s['_id'])} for s in subjects]
    return jsonify(data)

@bp.route('/subjects/<subject_id>', methods=['GET'])
def get_subject(subject_id):
    mongo = get_db()
    subject = mongo.db.subjects.find_one({'_id': ObjectId(subject_id)})
    if not subject:
        return jsonify({'error': 'Not found'}), 404
    data = Subject.from_dict(subject).to_dict() | {'_id': str(subject['_id'])}
    return jsonify(data)
