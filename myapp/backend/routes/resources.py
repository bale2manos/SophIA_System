from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId
from . import bp
from flask import current_app
from datetime import datetime


def get_db():
    return current_app.config['MONGO']


def _professor_required():
    claims = get_jwt()
    if claims.get('role') != 'professor':
        return jsonify({'error': 'Forbidden'}), 403
    return None


def _student_required():
    claims = get_jwt()
    if claims.get('role') != 'student':
        return jsonify({'error': 'Forbidden'}), 403
    return None


@bp.route('/resources/<rid>', methods=['PUT'])
@jwt_required()
def update_resource(rid):
    err = _professor_required()
    if err:
        return err
    data = request.get_json() or {}
    update = {k: data[k] for k in ['title', 'type', 'description', 'due_date'] if k in data}
    mongo = get_db()
    mongo.db.resources.update_one({'_id': ObjectId(rid)}, {'$set': update})
    return jsonify({'success': True})


@bp.route('/resources/<rid>', methods=['DELETE'])
@jwt_required()
def delete_resource(rid):
    err = _professor_required()
    if err:
        return err
    mongo = get_db()
    mongo.db.resources.delete_one({'_id': ObjectId(rid)})
    return jsonify({'success': True})


@bp.route('/resources/<rid>/submissions', methods=['POST'])
@jwt_required()
def create_submission(rid):
    err = _student_required()
    if err:
        return err
    mongo = get_db()
    data = request.get_json() or {}
    sub = {
        'resource_id': ObjectId(rid),
        'student_email': get_jwt_identity(),
        'files': data.get('files', []),
        'grade': None,
        'feedback': None,
        'submitted_at': datetime.utcnow(),
    }
    result = mongo.db.submissions.insert_one(sub)
    return jsonify({'id': str(result.inserted_id)})
