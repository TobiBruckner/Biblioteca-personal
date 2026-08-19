from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Usuario, EstadoLectura, ESTADO_LECTURA
from sqlalchemy import func
try:
    from email_validator import validate_email, EmailNotValidError
    HAS_EMAIL_VALIDATOR = True
except ImportError:
    HAS_EMAIL_VALIDATOR = False

usuarios_bp = Blueprint('usuarios', __name__)

def _safe_str(value, max_len=None):
    if value is None:
        return None
    s = str(value).strip()
    if s == '':
        return None
    if max_len and len(s) > max_len:
        s = s[:max_len]
    return s

def _build_usuario_publico(usuario, current_user_id):
    q = EstadoLectura.query.filter_by(usuario_id=usuario.id)
    total = q.count()
    leidos = q.filter_by(estado=ESTADO_LECTURA['LEIDO']).count()
    en_curso = q.filter_by(estado=ESTADO_LECTURA['EN_CURSO']).count()
    quiero_leer = q.filter_by(estado=ESTADO_LECTURA['QUIERO_LEER']).count()
    favoritos = q.filter_by(favorito=True).count()

    avg_row = db.session.query(
        func.avg(EstadoLectura.calificacion)
    ).filter(
        EstadoLectura.usuario_id == usuario.id,
        EstadoLectura.calificacion.isnot(None)
    ).scalar()
    promedio = round(float(avg_row), 2) if avg_row is not None else None

    out = {
        'id': usuario.id,
        'username': usuario.username,
        'nombre_completo': usuario.nombre_completo,
        'created_at': usuario.created_at.isoformat() if usuario.created_at else None,
        'estadisticas': {
            'total_libros': total,
            'leidos': leidos,
            'en_curso': en_curso,
            'quiero_leer': quiero_leer,
            'favoritos': favoritos,
            'promedio_calificacion': promedio
        }
    }

    if current_user_id == usuario.id:
        out['email'] = usuario.email

    return out

@usuarios_bp.route('', methods=['GET'])
@jwt_required()
def listar_usuarios():
    current_user_id = int(get_jwt_identity())
    search = request.args.get('search', '').strip()

    q = Usuario.query
    if search:
        like = f'%{search}%'
        q = q.filter(Usuario.username.ilike(like))

    usuarios = q.order_by(Usuario.created_at.asc()).all()
    return jsonify([_build_usuario_publico(u, current_user_id) for u in usuarios])

@usuarios_bp.route('/<int:usuario_id>', methods=['GET'])
@jwt_required()
def detalle_usuario(usuario_id):
    current_user_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    return jsonify(_build_usuario_publico(usuario, current_user_id))

@usuarios_bp.route('/<int:usuario_id>/libros', methods=['GET'])
@jwt_required()
def biblioteca_usuario(usuario_id):
    current_user_id = int(get_jwt_identity())
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    estado_filtro = request.args.get('estado')
    favorito = request.args.get('favorito')
    search = request.args.get('search', '').strip()

    query = EstadoLectura.query.filter_by(usuario_id=usuario_id)

    if estado_filtro and estado_filtro in ESTADO_LECTURA.values():
        query = query.filter_by(estado=estado_filtro)

    if favorito is not None:
        query = query.filter_by(favorito=(favorito.lower() == 'true'))

    if search:
        from app.models import Libro
        like = f'%{search}%'
        query = query.join(Libro).filter(
            (Libro.titulo.like(like)) | (Libro.autor.like(like))
        )

    resultados = query.order_by(EstadoLectura.updated_at.desc()).all()

    es_propietario = (current_user_id == usuario_id)
    perfil = _build_usuario_publico(usuario, current_user_id)

    return jsonify({
        'usuario': perfil,
        'es_mi_biblioteca': es_propietario,
        'libros': [e.to_dict() for e in resultados]
    })
