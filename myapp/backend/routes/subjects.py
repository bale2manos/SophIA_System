from flask import jsonify
from flask_pymongo import PyMongo
from bson import ObjectId
from . import bp
from ..models.subject import Subject
from flask import current_app


def get_db():
    return current_app.config['MONGO']

@bp.route("/subjects", methods=["GET"])
def get_subjects():
    fake_email = "maria@uc3m.es"  # simula el usuario logueado
    mongo = get_db()
    user = mongo.db.users.find_one({"email": fake_email})
    if not user:
        return jsonify([])  # no hay asignaturas

    codes = user.get("subject_codes", [])
    subjects = list(mongo.db.subjects.find({"code": {"$in": codes}}))
    for subj in subjects:
        subj["_id"] = str(subj["_id"])
    return jsonify(subjects)


@bp.route('/subjects/<subject_id>', methods=['GET'])
def get_subject(subject_id):
    mongo = get_db()
    subject = mongo.db.subjects.find_one({'_id': ObjectId(subject_id)})
    if not subject:
        return jsonify({'error': 'Not found'}), 404
    data = Subject.from_dict(subject).to_dict() | {'_id': str(subject['_id'])}
    return jsonify(data)
