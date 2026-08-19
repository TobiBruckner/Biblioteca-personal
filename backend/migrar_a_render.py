import json
import os
import sys
import requests
from getpass import getpass

API_BASE = "https://biblioteca-personal-50ou.onrender.com/api"
EXPORT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "export_data_tobi.json")

def main():
    print("=" * 60)
    print("MIGRADOR DE BIBLIOTECA A RENDER (PRODUCCION)")
    print("=" * 60)
    print()

    if not os.path.exists(EXPORT_FILE):
        print(f"ERROR: No se encontro el archivo de exportacion: {EXPORT_FILE}")
        print("Primero ejecuta: python check_db.py para generar el JSON")
        return 1

    with open(EXPORT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    usuario_local = data.get("usuario", {})
    libros_local = data.get("libros", [])
    print(f"Datos cargados correctamente:")
    print(f"  - Usuario: {usuario_local.get('username')} <{usuario_local.get('email')}>")
    print(f"  - Libros para importar: {len(libros_local)}")
    print()

    email_registrado = usuario_local.get("email", "tobi.bruckner02@gmail.com")
    print(f"PASO 1: Asegurate de haberte REGISTRADO en la app web con:")
    print(f"        Email: {email_registrado}")
    print(f"        (usa LA MISMA contrasenia que tenias localmente)")
    print()
    print(f"        Link de registro: https://biblioteca-personal-tau.vercel.app/register")
    print()
    resp = input("Ya te registraste? (s/n): ").strip().lower()
    if resp != "s":
        print("Registrate primero y volve a ejecutar este script.")
        return 1

    print()
    print("PASO 2: Ingresa tus credenciales para iniciar sesion en PRODUCCION")
    email = input(f"Email [{email_registrado}]: ").strip()
    if not email:
        email = email_registrado
    password = getpass("Contrasenia: ").strip()
    if not password:
        print("ERROR: Contrasenia vacia.")
        return 1

    print()
    print("Iniciando sesion en Render...")
    try:
        r_login = requests.post(
            f"{API_BASE}/auth/login",
            json={"login": email, "password": password},
            timeout=30
        )
    except Exception as e:
        print(f"ERROR de conexion: {e}")
        return 1

    if r_login.status_code != 200:
        print(f"ERROR al iniciar sesion: {r_login.status_code}")
        try:
            print(f"Detalle: {r_login.json().get('error', r_login.text)}")
        except:
            print(f"Respuesta: {r_login.text}")
        if r_login.status_code == 401:
            print()
            print("Posibles causas:")
            print("  - Todavia NO te registraste en la app web")
            print("  - La contrasenia NO es la misma que usabas localmente")
            print("  - Te registraste con un email diferente")
            print()
            print("SOLUCION: Entra a https://biblioteca-personal-tau.vercel.app/register")
            print("          y crea la cuenta con el email correcto y tu contrasenia habitual.")
        return 1

    tokens = r_login.json()
    access_token = tokens.get("access_token")
    user_render = tokens.get("usuario", {})
    print(f"Login OK. Bienvenido: {user_render.get('username')} (ID={user_render.get('id')})")
    print()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    print(f"PASO 3: Verificando libros existentes en produccion...")
    try:
        r_existing = requests.get(f"{API_BASE}/libros", headers=headers, timeout=30)
        if r_existing.status_code == 200:
            existing = r_existing.json()
            print(f"Libros YA existentes en tu biblioteca de produccion: {len(existing)}")
            existing_titulos = {e.get("libro", {}).get("titulo", "").lower() for e in existing}
            existing_isbns = {e.get("libro", {}).get("isbn") for e in existing if e.get("libro", {}).get("isbn")}
        else:
            print(f"  (no se pudieron listar: {r_existing.status_code}) - continuando de todas formas")
            existing_titulos = set()
            existing_isbns = set()
    except Exception as e:
        print(f"  (error al listar: {e}) - continuando de todas formas")
        existing_titulos = set()
        existing_isbns = set()

    print()
    print(f"PASO 4: Importando {len(libros_local)} libros...")
    print("-" * 60)

    ok = 0
    skip = 0
    errores = []
    for i, item in enumerate(libros_local, 1):
        libro_data = item.get("libro", {})
        estado_data = item.get("estado", {})

        isbn = libro_data.get("isbn")
        titulo = libro_data.get("titulo")
        autor = libro_data.get("autor")

        label = f"[{i}/{len(libros_local)}] \"{titulo}\" - {autor}"

        titulo_low = (titulo or "").lower()
        ya_existe = False
        if isbn and isbn in existing_isbns:
            ya_existe = True
        elif titulo_low and titulo_low in existing_titulos:
            ya_existe = True

        if ya_existe:
            print(f"  OK (saltar - ya existe) {label}")
            skip += 1
            continue

        payload = {
            "titulo": libro_data.get("titulo"),
            "autor": libro_data.get("autor"),
            "isbn": libro_data.get("isbn"),
            "genero": libro_data.get("genero"),
            "sinopsis": libro_data.get("sinopsis"),
            "paginas": libro_data.get("paginas"),
            "anio_publicacion": libro_data.get("anio_publicacion"),
            "editorial": libro_data.get("editorial"),
            "portada_url": libro_data.get("portada_url"),
            "estado": estado_data.get("estado"),
            "paginas_leidas": estado_data.get("paginas_leidas", 0),
            "calificacion": estado_data.get("calificacion"),
            "resena": estado_data.get("resena"),
            "favorito": estado_data.get("favorito", False),
            "fecha_inicio": estado_data.get("fecha_inicio"),
            "fecha_fin": estado_data.get("fecha_fin"),
        }

        try:
            r_add = requests.post(
                f"{API_BASE}/libros",
                json=payload,
                headers=headers,
                timeout=30
            )
        except Exception as e:
            errores.append(f"{label} -> Error de red: {e}")
            print(f"  ERROR {label} -> {e}")
            continue

        if r_add.status_code in (200, 201, 409):
            if r_add.status_code == 409:
                try:
                    detalle = r_add.json().get("error", "ya estaba")
                except:
                    detalle = "conflicto"
                print(f"  OK (saltar - {detalle}) {label}")
                skip += 1
            else:
                print(f"  IMPORTADO {label}")
                ok += 1
                try:
                    resp_data = r_add.json()
                    estado_nuevo = resp_data.get("estado_lectura", {})
                    libro_nuevo = estado_nuevo.get("libro", {})
                    if libro_nuevo.get("isbn"):
                        existing_isbns.add(libro_nuevo["isbn"])
                    if libro_nuevo.get("titulo"):
                        existing_titulos.add(libro_nuevo["titulo"].lower())
                except:
                    pass
        else:
            try:
                detalle = r_add.json()
            except:
                detalle = r_add.text
            errores.append(f"{label} -> HTTP {r_add.status_code}: {detalle}")
            print(f"  ERROR HTTP {r_add.status_code} {label} -> {detalle}")

    print("-" * 60)
    print()
    print("RESUMEN:")
    print(f"  Importados OK : {ok}")
    print(f"  Saltados (ya existian): {skip}")
    print(f"  Errores       : {len(errores)}")
    if errores:
        print()
        print("Detalles de errores:")
        for e in errores:
            print(f"  - {e}")
    print()
    if ok + skip == len(libros_local):
        print("=" * 60)
        print("MIGRACION COMPLETADA CON EXITO! 🎉")
        print("Ahora podes entrar con tu cuenta en:")
        print("  https://biblioteca-personal-tau.vercel.app/login")
        print("=" * 60)
    elif ok > 0:
        print("MIGRACION PARCIAL - algunos libros se importaron, revisa errores.")
    else:
        print("NO SE IMPORTARON LIBROS - revisa los errores de arriba.")
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
