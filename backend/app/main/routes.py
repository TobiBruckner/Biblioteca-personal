from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Usuario, EstadoLectura, ESTADO_LECTURA

main_bp = Blueprint('main', __name__)

@main_bp.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'message': 'API Biblioteca Personal funcionando correctamente',
        'version': '1.0.0'
    })

@main_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())

    total_libros = EstadoLectura.query.filter_by(usuario_id=user_id).count()
    leidos = EstadoLectura.query.filter_by(usuario_id=user_id, estado=ESTADO_LECTURA['LEIDO']).count()
    en_curso = EstadoLectura.query.filter_by(usuario_id=user_id, estado=ESTADO_LECTURA['EN_CURSO']).count()
    quiero_leer = EstadoLectura.query.filter_by(usuario_id=user_id, estado=ESTADO_LECTURA['QUIERO_LEER']).count()
    favoritos = EstadoLectura.query.filter_by(usuario_id=user_id, favorito=True).count()

    return jsonify({
        'total_libros': total_libros,
        'leidos': leidos,
        'en_curso': en_curso,
        'quiero_leer': quiero_leer,
        'favoritos': favoritos
    })
