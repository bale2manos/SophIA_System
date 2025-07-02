from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId
from . import bp
from ..models.subject import Subject
from flask import current_app
from datetime import datetime


def get_db():
    return current_app.config['MONGO']


@bp.route('/subjects', methods=['GET'])
@jwt_required()
def list_subjects():
    mongo = get_db()
    claims = get_jwt()
    email = get_jwt_identity()
    role = claims.get('role')
    if role == 'student':
        user = mongo.db.users.find_one({'email': email})
        codes = user.get('subject_codes', []) if user else []
        query = {'code': {'$in': codes}}
    elif role == 'professor':
        query = {'professors': email}
    else:
        query = {}
    subjects = mongo.db.subjects.find(query)
    data = [Subject.from_dict(s).to_dict() for s in subjects]
    return jsonify(data)


@bp.route('/subjects/<code>', methods=['GET'])
def get_subject(code):
    mongo = get_db()
    subject = mongo.db.subjects.find_one({'code': code}, {'_id': 0})
    if not subject:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(subject)


@bp.route('/subjects/<code>/resources', methods=['GET'])
@jwt_required()
def list_resources(code):
    mongo = get_db()
    resources = mongo.db.resources.find({'subject_code': code})
    data = []
    for r in resources:
        r['id'] = str(r['_id'])
        del r['_id']
        data.append(r)
    return jsonify(data)


@bp.route('/subjects/<code>/resources', methods=['POST'])
@jwt_required()
def create_resource(code):
    claims = get_jwt()
    if claims.get('role') != 'professor':
        return jsonify({'error': 'Forbidden'}), 403
    mongo = get_db()
    data = request.get_json() or {}
    resource = {
        'subject_code': code,
        'title': data.get('title'),
        'type': data.get('type'),
        'description': data.get('description'),
        'attachments': [],
        'created_by': get_jwt_identity(),
        'created_at': datetime.utcnow(),
        'due_date': data.get('due_date'),
    }
    result = mongo.db.resources.insert_one(resource)
    return jsonify({'id': str(result.inserted_id)}), 201
