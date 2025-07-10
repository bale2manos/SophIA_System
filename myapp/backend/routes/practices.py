from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from dateutil import parser
from datetime import datetime
from . import bp
from flask import current_app
from .resources import _student_required


def get_db():
    return current_app.config['MONGO']


@bp.route('/practices/<rid>/start', methods=['POST'])
@jwt_required()
def start_practice(rid):
    """Create or return a practice chat document for the student"""
    err = _student_required()
    if err:
        return err

    mongo = get_db()
    email = get_jwt_identity()

    doc = mongo.db.student_practices.find_one({'practice_id': ObjectId(rid), 'student_email': email})
    if not doc:
        res = mongo.db.resources.find_one({'_id': ObjectId(rid)}, {'subject_code': 1})
        practice = {
            'subject_code': res.get('subject_code') if res else None,
            'practice_id': ObjectId(rid),
            'student_email': email,
            'started_at': datetime.utcnow(),
            'messages': [],
            'completed': False,
        }
        result = mongo.db.student_practices.insert_one(practice)
        doc_id = result.inserted_id
        messages = []
    else:
        doc_id = doc['_id']
        messages = doc.get('messages', [])

    return jsonify({'practice_doc_id': str(doc_id), 'messages': messages})


@bp.route('/practices/<rid>/messages', methods=['POST'])
@jwt_required()
def add_messages(rid):
    err = _student_required()
    if err:
        return err

    data = request.get_json() or {}
    msgs = data.get('messages') or []
    processed = []
    print("ME HA LLEGADO UN MENSAJE")
    
    for m in msgs:
        ts = m.get('ts')
        if isinstance(ts, str):
            try:
                ts = parser.isoparse(ts)
            except Exception:
                ts = datetime.utcnow()
        processed.append({'text': m.get('text'), 'ts': ts, 'sender': 'student'})

    mongo = get_db()
    mongo.db.student_practices.update_one(
        {'practice_id': ObjectId(rid), 'student_email': get_jwt_identity()},
        {'$push': {'messages': {'$each': processed}}}
    )
    return jsonify({'success': True})
