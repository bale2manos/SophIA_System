from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from bson import ObjectId
from . import bp
from flask import current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timezone
from dateutil import parser


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

    # —————— PARSEO de due_date ——————
    if 'due_date' in data:
        if data['due_date']:
            try:
                data['due_date'] = parser.isoparse(data['due_date'])
            except Exception:
                return jsonify({'error': 'Invalid due_date format'}), 400
        else:
            data['due_date'] = None
    # ————————————————————————————

    # Solo actualizamos los campos permitidos
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


@bp.route('/resources/<rid>/submit', methods=['POST'])
@jwt_required()
def submit_file(rid):
    """Allow students to upload an exercise file"""
    # Check student role
    err = _student_required()
    if err:
        return err

    mongo = get_db()
    resource = mongo.db.resources.find_one({'_id': ObjectId(rid)})
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404

    # Normalize and compare due_date as aware datetimes
    due = resource.get('due_date')
    if due:
        # If still a string, parse it
        if isinstance(due, str):
            try:
                due = parser.isoparse(due)
            except Exception:
                return jsonify({'error': 'Invalid due_date in database'}), 500
        # Current time in UTC (aware)
        now = datetime.now(timezone.utc)
        # If due is naive, assign UTC
        if due.tzinfo is None:
            due = due.replace(tzinfo=timezone.utc)
        # If past due, reject
        if now > due:
            return jsonify({'error': 'Past due date'}), 400

    # Retrieve file from form
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file provided'}), 400

    # Build path: UPLOAD_FOLDER/{resource_id}/{student_email}/filename
    email = get_jwt_identity()
    base_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], rid, email)
    os.makedirs(base_dir, exist_ok=True)
    filename = secure_filename(file.filename)
    relative_path = os.path.join(rid, email, filename)
    full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], relative_path)
    file.save(full_path)

    # Prepare submission record
    submission_data = {
        'resource_id': ObjectId(rid),
        'student_email': email,
        'file_path': relative_path,
        'submitted_at': datetime.now(timezone.utc),
    }
    existing = mongo.db.submissions.find_one({
        'resource_id': ObjectId(rid),
        'student_email': email
    })
    if existing:
        mongo.db.submissions.update_one(
            {'_id': existing['_id']},
            {'$set': submission_data}
        )
    else:
        submission_data['grade'] = None
        mongo.db.submissions.insert_one(submission_data)

    return jsonify({'message': 'Submitted successfully'}), 200


@bp.route('/resources/<rid>/submissions', methods=['GET'])
@jwt_required()
def list_submissions(rid):
    err = _professor_required()
    if err:
        return err
    mongo = get_db()
    subs = mongo.db.submissions.find({'resource_id': ObjectId(rid)})
    result = []
    for s in subs:
        user = mongo.db.users.find_one({'email': s['student_email']})
        name = user.get('name') if user else s['student_email']
        result.append({
            'id': str(s['_id']),
            'student_email': s['student_email'],
            'name': name,
            'file_url': '/uploads/' + s['file_path'],
            'grade': s.get('grade'),
        })
    return jsonify(result)


@bp.route('/submissions/<sid>', methods=['PATCH'])
@jwt_required()
def grade_submission(sid):
    err = _professor_required()
    if err:
        return err
    mongo = get_db()
    data = request.get_json() or {}
    grade = data.get('grade')
    mongo.db.submissions.update_one({'_id': ObjectId(sid)}, {'$set': {'grade': grade}})
    return jsonify({'success': True})
