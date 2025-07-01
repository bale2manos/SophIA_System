from flask import request, jsonify
from . import bp

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    # TODO: validate username and password
    token = 'fake-token-for-' + username
    return jsonify({'token': token})
