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


@bp.route('/resources/<rid>', methods=['GET'])
@jwt_required()
def get_resource(rid):
    """Return full information about a resource"""
    mongo = get_db()
    res = mongo.db.resources.find_one({'_id': ObjectId(rid)})
    if not res:
        return jsonify({'error': 'Not found'}), 404

    result = {
        'id': str(res['_id']),
        'subject_code': res.get('subject_code'),
        'title': res.get('title'),
        'type': res.get('type'),
        'description': res.get('description'),
        'due_date': res.get('due_date'),
        'attachments': [
            {
                'file_url': '/uploads/' + p,
                'filename': os.path.basename(p),
            }
            for p in res.get('attachments', [])
        ],
    }
    return jsonify(result)


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


@bp.route('/resources/<rid>/implementation_link', methods=['PUT'])
@jwt_required()
def set_practice_link(rid):
    err = _professor_required()
    if err:
        return err

    data = request.get_json() or {}
    link = data.get('practice_external_url')

    mongo = get_db()
    res = mongo.db.resources.find_one({'_id': ObjectId(rid)})
    if not res:
        return jsonify({'error': 'Resource not found'}), 404
    if res.get('type') != 'practice':
        return jsonify({'error': 'Invalid resource type'}), 400

    mongo.db.resources.update_one(
        {'_id': ObjectId(rid)},
        {'$set': {'practice_external_url': link}}
    )
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

@bp.route('/resources/<rid>/submission', methods=['GET'])
@jwt_required()
def get_my_submission(rid):
    """
    Devuelve la submission de recurso <rid> correspondiente
    al alumno logueado (su único registro).
    """
    mongo = get_db()
    # 1) Identidad del alumno (su email, según tu token)
    student_email = get_jwt_identity()

    # 2) Busca sólo su entrega en Mongo
    sub = mongo.db.submissions.find_one({
        'resource_id': ObjectId(rid),
        'student_email': student_email
    })

    # 3) Si no la tiene, devolvemos 404 o un array vacío
    if not sub:
        return jsonify({}), 404

    # 4) Formatea igual que en list_submissions
    return jsonify({
        'id': str(sub['_id']),
        'student_email': sub['student_email'],
        'name': sub.get('name', sub['student_email']),
        'file_url': '/uploads/' + sub['file_path'],
        'grade': sub.get('grade')
    })
    
    
@bp.route('/submissions/<sid>', methods=['DELETE'])
@jwt_required()
def delete_submission(sid):
    """
    Borra la submission con id <sid>. 
    - Si es el profesor, puede borrar cualquier entrega.
    - Si es el alumno, sólo puede borrar SU entrega.
    """
    mongo = get_db()
    # 1) Busca la entrega en la BBDD
    sub = mongo.db.submissions.find_one({'_id': ObjectId(sid)})
    if not sub:
        return jsonify({'msg': 'Submission not found'}), 404

    # 2) Comprueba permisos
    user_email = get_jwt_identity()
    # Si no es profesor y no es su propia entrega, deniega
    try:
        # _professor_required() devuelve un Response si falla o None si todo OK
        err = _professor_required()  
        is_prof = err is None  
    except Exception:
        is_prof = False

    if not is_prof and sub.get('student_email') != user_email:
        return jsonify({'msg': 'Forbidden'}), 403

    # 3) Borra el documento de la colección
    mongo.db.submissions.delete_one({'_id': ObjectId(sid)})

    """
    # 4) (Opcional) Borra también el fichero del sistema de ficheros
    path = os.path.join(current_app.config['UPLOAD_FOLDER'], sub['file_path'])
    if os.path.exists(path):
        os.remove(path)
    """

    # 5) Devuelve éxito
    return jsonify({'msg': 'Submission deleted'}), 200


@bp.route('/resources/<rid>/attachments', methods=['POST'])
@jwt_required()
def upload_attachment(rid):
    """Upload one or multiple attachment files for a lecture"""
    err = _professor_required()
    if err:
        return err

    mongo = get_db()
    res = mongo.db.resources.find_one({'_id': ObjectId(rid)})
    if not res:
        return jsonify({'error': 'Resource not found'}), 404

    attachments = res.get('attachments', [])

    # Accept both 'file' (single) and 'files' (multiple)
    files = request.files.getlist('files')
    if not files:
        single = request.files.get('file')
        if single:
            files = [single]

    if not files:
        return jsonify({'error': 'No file provided'}), 400

    if len(attachments) + len(files) > 10:
        return jsonify({'error': 'Maximum attachments reached'}), 400

    saved = []
    rel_paths = []
    for f in files:
        filename = secure_filename(f.filename)
        relative = os.path.join(rid, filename)
        full = os.path.join(current_app.config['UPLOAD_FOLDER'], relative)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        f.save(full)
        rel_paths.append(relative)
        saved.append({'file_url': '/uploads/' + relative, 'filename': filename})

    if rel_paths:
        mongo.db.resources.update_one(
            {"_id": ObjectId(rid)},
            {"$push": {"attachments": {"$each": rel_paths}}}
        )

    return jsonify(saved)


@bp.route('/resources/<rid>/attachments/<fname>', methods=['DELETE'])
@jwt_required()
def delete_attachment(rid, fname):
    err = _professor_required()
    if err:
        return err

    fname = secure_filename(fname)
    relative = os.path.join(rid, fname)
    mongo = get_db()
    mongo.db.resources.update_one({'_id': ObjectId(rid)}, {'$pull': {'attachments': relative}})

    path = os.path.join(current_app.config['UPLOAD_FOLDER'], relative)
    if os.path.exists(path):
        os.remove(path)

    return jsonify({'success': True})
