from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from email_validator import validate_email, EmailNotValidError
from app import db
from app.models import Usuario

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No se enviaron datos'}), 400

    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'El campo {field} es requerido'}), 400

    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    nombre_completo = data.get('nombre_completo', '').strip() or None

    if len(username) < 3:
        return jsonify({'error': 'El nombre de usuario debe tener al menos 3 caracteres'}), 400

    if len(password) < 6:
        return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400

    try:
        valid_email = validate_email(email, check_deliverability=False)
        email = valid_email.normalized
    except EmailNotValidError as e:
        return jsonify({'error': f'Email inválido: {str(e)}'}), 400

    if Usuario.query.filter_by(username=username).first():
        return jsonify({'error': 'El nombre de usuario ya está en uso'}), 409

    if Usuario.query.filter_by(email=email).first():
        return jsonify({'error': 'El email ya está registrado'}), 409

    nuevo_usuario = Usuario(
        username=username,
        email=email,
        nombre_completo=nombre_completo
    )
    nuevo_usuario.set_password(password)

    db.session.add(nuevo_usuario)
    db.session.commit()

    access_token = create_access_token(identity=str(nuevo_usuario.id))
    refresh_token = create_refresh_token(identity=str(nuevo_usuario.id))

    return jsonify({
        'message': 'Usuario registrado exitosamente',
        'usuario': nuevo_usuario.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No se enviaron datos'}), 400

    login_identifier = data.get('login', '').strip()
    password = data.get('password', '')

    if not login_identifier or not password:
        return jsonify({'error': 'Credenciales incompletas'}), 400

    usuario = Usuario.query.filter(
        (Usuario.email == login_identifier.lower()) |
        (Usuario.username == login_identifier)
    ).first()

    if not usuario or not usuario.check_password(password):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    access_token = create_access_token(identity=str(usuario.id))
    refresh_token = create_refresh_token(identity=str(usuario.id))

    return jsonify({
        'message': 'Login exitoso',
        'usuario': usuario.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify({'usuario': usuario.to_dict()})

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))
    return jsonify({'access_token': access_token})

@auth_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = int(get_jwt_identity())
    usuario = Usuario.query.get(user_id)

    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    data = request.get_json() or {}

    if 'nombre_completo' in data:
        usuario.nombre_completo = data['nombre_completo'].strip() or None

    if 'password' in data and data['password']:
        if len(data['password']) < 6:
            return jsonify({'error': 'La contraseña debe tener al menos 6 caracteres'}), 400
        usuario.set_password(data['password'])

    db.session.commit()

    return jsonify({
        'message': 'Perfil actualizado',
        'usuario': usuario.to_dict()
    })
