import sys
import os
import json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app, db
from app.models import Usuario, Libro, EstadoLectura

app = create_app()
with app.app_context():
    print('=== USUARIOS EXISTENTES ===')
    usuarios = Usuario.query.all()
    for u in usuarios:
        estados = EstadoLectura.query.filter_by(usuario_id=u.id).all()
        print(f'ID={u.id} | username={u.username} | email={u.email} | nombre={u.nombre_completo} | libros={len(estados)}')
    
    print()
    print('=== BUSCANDO tobi.bruckner02@gmail.com ===')
    u = Usuario.query.filter(
        (Usuario.email == 'tobi.bruckner02@gmail.com') | 
        (Usuario.email == 'tobi.bruckner02@gmail.com'.lower())
    ).first()
    if u:
        print(f'ENCONTRADO: ID={u.id} | username={u.username} | email={u.email}')
        print()
        print('=== SUS LIBROS ===')
        estados = EstadoLectura.query.filter_by(usuario_id=u.id).all()
        print(f'Total de libros: {len(estados)}')
        print()
        export_data = {
            'usuario': u.to_dict(),
            'password_hash': u.password_hash,
            'libros': []
        }
        for i, el in enumerate(estados, 1):
            libro = el.libro
            entry = {
                'estado': el.to_dict(),
                'libro': libro.to_dict()
            }
            export_data['libros'].append(entry)
            print(f'{i}. "{libro.titulo}" - {libro.autor}')
            print(f'   Estado: {el.estado} | Paginas leidas: {el.paginas_leidas}/{libro.paginas or "?"}')
            print(f'   Calificacion: {el.calificacion} | Favorito: {el.favorito}')
            print(f'   ISBN: {libro.isbn} | Genero: {libro.genero}')
            if el.fecha_inicio:
                print(f'   Fecha inicio: {el.fecha_inicio}')
            if el.fecha_fin:
                print(f'   Fecha fin: {el.fecha_fin}')
            if el.resena:
                r = el.resena[:80] + '...' if len(el.resena) > 80 else el.resena
                print(f'   Resena: {r}')
            print()
        
        with open('export_data_tobi.json', 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)
        print('Datos exportados a: export_data_tobi.json')
    else:
        print('Usuario NO encontrado en la base de datos local')
        print()
        print('Emails registrados:')
        for u in Usuario.query.all():
            print(f'  - {u.email} (username: {u.username})')
