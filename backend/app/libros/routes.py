from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Libro, EstadoLectura, ESTADO_LECTURA
from datetime import datetime

libros_bp = Blueprint('libros', __name__)

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

def _parse_fecha(fecha_str):
    if not fecha_str:
        return None
    try:
        return datetime.strptime(fecha_str, '%Y-%m-%d').date()
    except ValueError:
        return None

@libros_bp.route('', methods=['POST'])
@jwt_required()
def add_libro():
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No se enviaron datos'}), 400

    if not data.get('titulo') or not data.get('autor'):
        return jsonify({'error': 'Título y autor son requeridos'}), 400

    isbn = data.get('isbn', '').strip() or None

    libro = None
    if isbn:
        libro = Libro.query.filter_by(isbn=isbn).first()

    if not libro:
        libro = Libro(
            titulo=data['titulo'].strip(),
            autor=data['autor'].strip(),
            isbn=isbn,
            genero=data.get('genero', '').strip() or None,
            sinopsis=data.get('sinopsis', '').strip() or None,
            paginas=data.get('paginas'),
            anio_publicacion=data.get('anio_publicacion'),
            editorial=data.get('editorial', '').strip() or None,
            portada_url=data.get('portada_url', '').strip() or None
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
        paginas_leidas=data.get('paginas_leidas', 0),
        calificacion=data.get('calificacion'),
        resena=data.get('resena', '').strip() or None,
        favorito=data.get('favorito', False),
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
        libro.titulo = data['titulo'].strip()
    if 'autor' in data:
        libro.autor = data['autor'].strip()
    if 'isbn' in data:
        libro.isbn = data['isbn'].strip() or None
    if 'genero' in data:
        libro.genero = data['genero'].strip() or None
    if 'sinopsis' in data:
        libro.sinopsis = data['sinopsis'].strip() or None
    if 'paginas' in data:
        libro.paginas = data['paginas']
    if 'anio_publicacion' in data:
        libro.anio_publicacion = data['anio_publicacion']
    if 'editorial' in data:
        libro.editorial = data['editorial'].strip() or None
    if 'portada_url' in data:
        libro.portada_url = data['portada_url'].strip() or None

    if 'estado' in data and data['estado'] in ESTADO_LECTURA.values():
        estado.estado = data['estado']
        if data['estado'] == ESTADO_LECTURA['EN_CURSO'] and not estado.fecha_inicio:
            estado.fecha_inicio = datetime.utcnow().date()
        if data['estado'] == ESTADO_LECTURA['LEIDO'] and not estado.fecha_fin:
            estado.fecha_fin = datetime.utcnow().date()

    if 'paginas_leidas' in data:
        estado.paginas_leidas = data['paginas_leidas']
    if 'calificacion' in data:
        estado.calificacion = data['calificacion']
    if 'resena' in data:
        estado.resena = data['resena'].strip() or None
    if 'favorito' in data:
        estado.favorito = data['favorito']
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
