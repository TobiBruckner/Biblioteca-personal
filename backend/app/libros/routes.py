from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Libro, EstadoLectura, ESTADO_LECTURA
from datetime import datetime

libros_bp = Blueprint('libros', __name__)

def _safe_str(value):
    if value is None:
        return None
    s = str(value).strip()
    return s if s else None

def _safe_int(value):
    if value is None:
        return None
    if isinstance(value, bool):
        return int(value)
    try:
        return int(value)
    except (ValueError, TypeError):
        return None

def _safe_float(value):
    if value is None:
        return None
    if isinstance(value, bool):
        return float(value)
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

def _parse_fecha(fecha_str):
    if not fecha_str:
        return None
    try:
        return datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return None

@libros_bp.route('', methods=['GET'])
@jwt_required()
def get_libros():
    user_id = int(get_jwt_identity())
    estado = request.args.get('estado')
    favorito = request.args.get('favorito')
    search = request.args.get('search', '').strip()

    query = EstadoLectura.query.filter_by(usuario_id=user_id)

    if estado and estado in ESTADO_LECTURA.values():
        query = query.filter_by(estado=estado)

    if favorito is not None:
        query = query.filter_by(favorito=(favorito.lower() == 'true'))

    if search:
        like = f'%{search}%'
        query = query.join(Libro).filter(
            (Libro.titulo.like(like)) | (Libro.autor.like(like))
        )

    resultados = query.order_by(EstadoLectura.updated_at.desc()).all()
    return jsonify([e.to_dict() for e in resultados])

@libros_bp.route('/<int:libro_id>', methods=['GET'])
@jwt_required()
def get_libro(libro_id):
    user_id = int(get_jwt_identity())
    estado = EstadoLectura.query.filter_by(usuario_id=user_id, libro_id=libro_id).first()
    if not estado:
        return jsonify({'error': 'Libro no encontrado en tu biblioteca'}), 404
    return jsonify(estado.to_dict())

@libros_bp.route('', methods=['POST'])
@jwt_required()
def add_libro():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No se enviaron datos'}), 400

    titulo = _safe_str(data.get('titulo'))
    autor = _safe_str(data.get('autor'))
    if not titulo or not autor:
        return jsonify({'error': 'Título y autor son requeridos'}), 400

    isbn = _safe_str(data.get('isbn'))

    libro = None
    if isbn:
        libro = Libro.query.filter_by(isbn=isbn).first()

    if not libro:
        libro = Libro(
            titulo=titulo,
            autor=autor,
            isbn=isbn,
            genero=_safe_str(data.get('genero')),
            sinopsis=_safe_str(data.get('sinopsis')),
            paginas=_safe_int(data.get('paginas')),
            anio_publicacion=_safe_int(data.get('anio_publicacion')),
            editorial=_safe_str(data.get('editorial')),
            portada_url=_safe_str(data.get('portada_url'))
        )
        db.session.add(libro)
        db.session.flush()

    existing = EstadoLectura.query.filter_by(usuario_id=user_id, libro_id=libro.id).first()
    if existing:
        return jsonify({
            'error': 'Este libro ya está en tu biblioteca',
            'estado_lectura': existing.to_dict()
        }), 409

    estado_valor = data.get('estado', ESTADO_LECTURA['QUIERO_LEER'])
    if estado_valor not in ESTADO_LECTURA.values():
        estado_valor = ESTADO_LECTURA['QUIERO_LEER']

    nuevo_estado = EstadoLectura(
        usuario_id=user_id,
        libro_id=libro.id,
        estado=estado_valor,
        paginas_leidas=_safe_int(data.get('paginas_leidas')) or 0,
        calificacion=_safe_float(data.get('calificacion')),
        resena=_safe_str(data.get('resena')),
        favorito=bool(data.get('favorito', False)),
        fecha_inicio=_parse_fecha(data.get('fecha_inicio')),
        fecha_fin=_parse_fecha(data.get('fecha_fin'))
    )

    db.session.add(nuevo_estado)
    db.session.commit()

    return jsonify({
        'message': 'Libro agregado a tu biblioteca',
        'estado_lectura': nuevo_estado.to_dict()
    }), 201

@libros_bp.route('/<int:libro_id>', methods=['PUT'])
@jwt_required()
def update_libro(libro_id):
    user_id = int(get_jwt_identity())
    estado = EstadoLectura.query.filter_by(usuario_id=user_id, libro_id=libro_id).first()

    if not estado:
        return jsonify({'error': 'Libro no encontrado en tu biblioteca'}), 404

    data = request.get_json() or {}

    libro = estado.libro
    if 'titulo' in data:
        v = _safe_str(data['titulo'])
        if v is not None:
            libro.titulo = v
    if 'autor' in data:
        v = _safe_str(data['autor'])
        if v is not None:
            libro.autor = v
    if 'isbn' in data:
        libro.isbn = _safe_str(data['isbn'])
    if 'genero' in data:
        libro.genero = _safe_str(data['genero'])
    if 'sinopsis' in data:
        libro.sinopsis = _safe_str(data['sinopsis'])
    if 'paginas' in data:
        libro.paginas = _safe_int(data['paginas'])
    if 'anio_publicacion' in data:
        libro.anio_publicacion = _safe_int(data['anio_publicacion'])
    if 'editorial' in data:
        libro.editorial = _safe_str(data['editorial'])
    if 'portada_url' in data:
        libro.portada_url = _safe_str(data['portada_url'])

    if 'estado' in data and data['estado'] in ESTADO_LECTURA.values():
        estado.estado = data['estado']
        if data['estado'] == ESTADO_LECTURA['EN_CURSO'] and not estado.fecha_inicio:
            estado.fecha_inicio = datetime.utcnow().date()
        if data['estado'] == ESTADO_LECTURA['LEIDO'] and not estado.fecha_fin:
            estado.fecha_fin = datetime.utcnow().date()

    if 'paginas_leidas' in data:
        v = _safe_int(data['paginas_leidas'])
        estado.paginas_leidas = v if v is not None else 0
    if 'calificacion' in data:
        estado.calificacion = _safe_float(data['calificacion'])
    if 'resena' in data:
        estado.resena = _safe_str(data['resena'])
    if 'favorito' in data:
        estado.favorito = bool(data['favorito'])
    if 'fecha_inicio' in data:
        estado.fecha_inicio = _parse_fecha(data['fecha_inicio'])
    if 'fecha_fin' in data:
        estado.fecha_fin = _parse_fecha(data['fecha_fin'])

    db.session.commit()

    return jsonify({
        'message': 'Libro actualizado',
        'estado_lectura': estado.to_dict()
    })

@libros_bp.route('/<int:libro_id>', methods=['DELETE'])
@jwt_required()
def delete_libro(libro_id):
    user_id = int(get_jwt_identity())
    estado = EstadoLectura.query.filter_by(usuario_id=user_id, libro_id=libro_id).first()

    if not estado:
        return jsonify({'error': 'Libro no encontrado en tu biblioteca'}), 404

    db.session.delete(estado)
    db.session.commit()

    return jsonify({'message': 'Libro eliminado de tu biblioteca'})
