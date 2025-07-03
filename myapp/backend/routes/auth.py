from flask import request, jsonify
from flask_jwt_extended import create_access_token
from . import bp
from flask import current_app
import bcrypt


def get_db():
    return current_app.config['MONGO']


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'error': 'Missing credentials'}), 400

    print(f"Attempting login for email: {email}")
    mongo = get_db()
    print("Connected to MongoDB...")
    
    user = mongo.db.users.find_one({'email': email})
    if not user or not bcrypt.checkpw(password.encode(), user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    print(f"User found: {user['email']}, role: {user.get('role')}")

    access_token = create_access_token(identity=email, additional_claims={
        'role': user.get('role'),
        'name': user.get('name')
    })
    return jsonify({
        'access_token': access_token,
        'role': user.get('role'),
        'name': user.get('name')
    })

@bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Test endpoint is working!'}), 200