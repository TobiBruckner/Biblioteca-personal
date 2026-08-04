import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app, db
from app.models import Usuario, Libro, EstadoLectura, ESTADO_LECTURA
from datetime import date

app = create_app()

with app.app_context():
    db.create_all()
    u = Usuario.query.filter_by(username='demo').first()
    if not u:
        u = Usuario(username='demo', email='demo@biblioteca.com', nombre_completo='Usuario Demo')
        u.set_password('demo123456')
        db.session.add(u)
        db.session.flush()
        print(f'Usuario demo creado: demo@biblioteca.com / demo123456')
    else:
        print(f'Usuario demo ya existe (id={u.id})')

    def add_book(titulo, autor, **kwargs):
        isbn = kwargs.pop('isbn', None)
        if isbn:
            l = Libro.query.filter_by(isbn=isbn).first()
        else:
            l = Libro.query.filter_by(titulo=titulo, autor=autor).first()
        if not l:
            l = Libro(titulo=titulo, autor=autor, isbn=isbn)
            for k, v in kwargs.items():
                if hasattr(l, k):
                    setattr(l, k, v)
            db.session.add(l)
            db.session.flush()

        if not EstadoLectura.query.filter_by(usuario_id=u.id, libro_id=l.id).first():
            el = EstadoLectura(usuario_id=u.id, libro_id=l.id)
            el.estado = kwargs.pop('estado', ESTADO_LECTURA['QUIERO_LEER'])
            el.paginas_leidas = kwargs.pop('paginas_leidas', 0)
            el.calificacion = kwargs.pop('calificacion', None)
            el.resena = kwargs.pop('resena', None)
            el.favorito = kwargs.pop('favorito', False)
            el.fecha_inicio = kwargs.pop('fecha_inicio', None)
            el.fecha_fin = kwargs.pop('fecha_fin', None)
            db.session.add(el)
            print(f'  -> Agregado: {titulo} [{el.estado}]')
        else:
            print(f'  -> Ya existia: {titulo}')

    add_book(
        'Cien anos de soledad', 'Gabriel Garcia Marquez',
        isbn='9780307474728', genero='Realismo magico', paginas=432,
        anio_publicacion=1967, editorial='Diana',
        estado=ESTADO_LECTURA['LEIDO'], calificacion=5, favorito=True,
        fecha_fin=date(2026, 6, 15), resena='Obra maestra de la literatura.'
    )
    add_book(
        'El principito', 'Antoine de Saint-Exupery',
        genero='Fabula', paginas=96,
        estado=ESTADO_LECTURA['EN_CURSO'], paginas_leidas=50,
        fecha_inicio=date(2026, 7, 20)
    )
    add_book(
        '1984', 'George Orwell',
        genero='Distopia', paginas=328, anio_publicacion=1949,
        estado=ESTADO_LECTURA['QUIERO_LEER']
    )
    add_book(
        'Sapiens', 'Yuval Noah Harari',
        genero='Ensayo', paginas=464,
        estado=ESTADO_LECTURA['LEIDO'], calificacion=4,
        resena='Interesante vision de la historia humana.'
    )
    add_book(
        'El nombre del viento', 'Patrick Rothfuss',
        genero='Fantasia epica', paginas=672,
        estado=ESTADO_LECTURA['EN_CURSO'], paginas_leidas=200,
        fecha_inicio=date(2026, 8, 1), favorito=True
    )
    add_book(
        'Dune', 'Frank Herbert',
        genero='Ciencia ficcion', paginas=688, anio_publicacion=1965,
        estado=ESTADO_LECTURA['QUIERO_LEER']
    )
    add_book(
        'La sombra del viento', 'Carlos Ruiz Zafon',
        genero='Misterio', paginas=512,
        estado=ESTADO_LECTURA['LEIDO'], calificacion=5, favorito=True,
        resena='Ambiente atmosferico y personajes inolvidables.'
    )
    add_book(
        'Orgullo y prejuicio', 'Jane Austen',
        genero='Romance clasico', paginas=432,
        estado=ESTADO_LECTURA['QUIERO_LEER']
    )
    db.session.commit()
    print('\nSeed completado con exito!')
