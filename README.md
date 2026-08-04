# 📚 Mi Biblioteca Personal

> Gestor web para organizar tus lecturas al estilo Whakoom. Lleva un registro de libros leídos, en curso, deseados, sus reseñas, calificaciones y estadísticas personales.

![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-CC2927?logo=python&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000?logo=jsonwebtokens&logoColor=white)
![SQLite](https://img.shields.io/badge/DB-SQLite-003B57?logo=sqlite&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![Status](https://img.shields.io/badge/Status-MVP%20Completo-22c55e)

---

## 🎯 Sobre el proyecto

Este proyecto fue desarrollado como parte de mi portfolio personal siendo estudiante de **Analista de Sistemas**. La idea es replicar la experiencia de Whakoom (cómics) pero para **libros**: tener mi colección organizada, seguir el progreso de lectura, guardar reseñas y calificaciones, y visualizar estadísticas.

Construido con **React** en el frontend y **Flask** (SQLAlchemy + JWT) en el backend, usando **SQLite** como base de datos local en desarrollo.

### ✨ Funcionalidades implementadas (MVP)

- 🔐 **Autenticación de usuarios** (registro / login / refresh token / JWT)
- 📚 **Mi Biblioteca**: listado completo de todos los libros agregados
- ⏳ **En Curso**: libros que estoy leyendo, con barra de **progreso visual** (%)
- 📖 **Quiero Leer**: wishlist / TBR (To Be Read)
- ✅ **Libros leídos** con calificación (⭐ 1-5) y reseña personal
- ⭐ Marcar libros como **favoritos**
- 🔍 **Buscador** por título y autor
- 📊 **Panel principal** con estadísticas (totales por estado + favoritos)
- ➕ **Agregar / editar / eliminar** libros con modal completo
- 📝 Datos por libro: título, autor, ISBN, género, sinopsis, páginas, año, editorial, URL de portada
- 📅 Seguimiento de **fechas** (fecha inicio / fecha fin de lectura)
- 🎨 UI **responsive** (mobile + desktop) con tema oscuro moderno

---

## 🏗️ Arquitectura y Stack

```
biblioteca-personal/
├── backend/              # API REST · Python Flask
│   ├── run.py            # Entrypoint
│   ├── config.py         # Configuración app
│   ├── seed_demo.py      # Datos de ejemplo (8 libros + user demo)
│   └── app/
│       ├── __init__.py       # App factory + Blueprints
│       ├── models.py         # SQLAlchemy: Usuario / Libro / EstadoLectura
│       ├── auth/routes.py    # Endpoints auth: /register · /login · /me · /refresh
│       ├── libros/routes.py  # CRUD libros + filtros (estado / favorito / search)
│       └── main/routes.py    # /health + /stats
│
└── frontend/             # SPA · React 18 + Vite
    ├── vite.config.js    # Proxy /api → http://localhost:5000
    └── src/
        ├── App.jsx               # Rutas (PrivateRoute / GuestRoute)
        ├── main.jsx              # Providers (Auth · Router)
        ├── context/AuthContext   # Estado global + persistencia localStorage
        ├── services/api.js       # Axios + interceptor JWT auto-refresh
        ├── components/           # Layout · BookCard · BookList · BookModal
        ├── pages/                # Login · Register · Dashboard · Biblioteca · EnCurso · QuieroLeer
        └── styles/global.css     # Tema oscuro + diseño
```

### 🧰 Tecnologías por capa

| Capa         | Tecnologías                                      |
| ------------ | ------------------------------------------------ |
| **Frontend** | React 18, React Router v6, Axios, Vite 5, CSS moderno (CSS variables, grid, flex) |
| **Backend**  | Flask 3, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS, email-validator, python-dotenv |
| **Base de datos** | SQLite (desarrollo) · portable a PostgreSQL/MySQL en producción |
| **Auth**     | JWT (access token 7 días + refresh token 30 días) · Passwords hasheados con Werkzeug |

---

## 🚀 Cómo ejecutar el proyecto en local

### 📋 Requisitos previos
- Python **3.10+** (probado con 3.14)
- Node.js **18+** (probado con 22)
- npm (viene con Node.js)
- Git

---

### 🐍 1) Backend (Flask · puerto 5000)

```powershell
# Clona el repo (si todavía no lo hiciste)
git clone https://github.com/TU-USUARIO/biblioteca-personal.git
cd biblioteca-personal

# Instala dependencias Python
cd backend
pip install -r requirements.txt

# OPCIONAL: carga el usuario demo + 8 libros de ejemplo
python seed_demo.py
#   → Usuario creado: demo@biblioteca.com / demo123456

# Inicia el servidor Flask (modo debug)
python run.py
#   → Backend corriendo en:  http://127.0.0.1:5000
#   → Health check:         http://127.0.0.1:5000/api/health
```

La base de datos SQLite se crea automáticamente en `backend/instance/biblioteca.db` al arrancar.

---

### ⚛️ 2) Frontend (React + Vite · puerto 5173)

```powershell
# Abre otra terminal en la raíz del proyecto
cd frontend

# Instala dependencias
npm install

# Inicia Vite en modo desarrollo
npm run dev
#   → Frontend corriendo en:  http://localhost:5173  (o el puerto libre que muestre Vite)
```

El frontend viene con un proxy configurado en [vite.config.js](file:///C:/Users/tobib/OneDrive%20-%20jbuckner/Escritorio/proyectos_personales/biblioteca/frontend/vite.config.js), así que todas las llamadas a `/api/*` se redirigen automáticamente al backend en el puerto 5000. **No necesitas configurar CORS manualmente en desarrollo.**

---

### 🔑 3) Usuarios de prueba

```
# Usuario demo (si corriste seed_demo.py)
Usuario / Email:  demo   |   demo@biblioteca.com
Contraseña:       demo123456
```

O simplemente crea tu cuenta propia desde **"Regístrate aquí"** en la pantalla de login.

---

## 🔌 Documentación de la API (endpoints principales)

Base URL: `http://localhost:5000/api`  
Todos los endpoints marcados con 🔐 requieren header: `Authorization: Bearer <access_token>`

### Autenticación
| Método | Endpoint           | Descripción                       |
| ------ | ------------------ | --------------------------------- |
| POST   | `/auth/register`   | Crear usuario nuevo               |
| POST   | `/auth/login`      | Login (username o email + pass)   |
| GET    | `/auth/me`       🔐 | Perfil del usuario logueado       |
| POST   | `/auth/refresh`    | Renovar access token (con refresh token) |
| PUT    | `/auth/update`   🔐 | Actualizar nombre / contraseña    |

### Libros de mi biblioteca
| Método | Endpoint                         | Descripción                                  |
| ------ | -------------------------------- | -------------------------------------------- |
| GET    | `/libros`                      🔐 | Todos mis libros (filtros abajo)             |
| GET    | `/libros/<id>`                 🔐 | Detalle completo de 1 libro + mi estado      |
| POST   | `/libros`                      🔐 | Agregar libro a mi biblioteca                |
| PUT    | `/libros/<id>`                 🔐 | Editar datos del libro + mi estado/progreso  |
| DELETE | `/libros/<id>`                 🔐 | Eliminar libro de mi biblioteca              |

#### Filtros disponibles en `GET /libros`
```
?estado=en_curso        → filtra por estado: en_curso | leido | quiero_leer
?favorito=true          → solo favoritos
?search=garcia          → busca por título o autor (LIKE %garcia%)
```
Ejemplo: `GET /api/libros?estado=en_curso&favorito=true`

### General
| Método | Endpoint   | Descripción                         |
| ------ | ---------- | ----------------------------------- |
| GET    | `/health`  | Check de salud + versión de la API |
| GET    | `/stats` 🔐 | Totales por estado + favoritos     |

---

## 🗺️ Modelo de datos (3 entidades)

```
┌───────────────┐        ┌────────────────────┐        ┌───────────────┐
│    Usuario    │        │   EstadoLectura    │        │     Libro     │
├───────────────┤        ├────────────────────┤        ├───────────────┤
│ id (PK)       │◄───────│ usuario_id (FK)    │   ┌───►│ id (PK)       │
│ username      │        │ libro_id (FK)      │───┘    │ titulo        │
│ email         │        │ estado             │        │ autor         │
│ password_hash │        │ paginas_leidas     │        │ isbn (UQ)     │
│ nombre_compl. │        │ calificacion       │        │ genero        │
│ created_at    │        │ resena             │        │ sinopsis      │
└───────────────┘        │ favorito           │        │ paginas       │
                         │ fecha_inicio       │        │ anio_public.  │
                         │ fecha_fin          │        │ editorial     │
                         │ created_at / up.   │        │ portada_url   │
                         └────────────────────┘        └───────────────┘

· Restricción UNIQUE (usuario_id, libro_id) en EstadoLectura
· 1 usuario → N estados de lectura
· 1 libro   → N estados de lectura (varios usuarios pueden tener el mismo libro)
```

---

## 🎨 Screenshots / Demo

*(Acá podés pegar capturas del dashboard, sección en curso, modal, login, etc.  
Puedes alojarlas dentro de una carpeta `/docs/img` del repo o usar servicios como imgur)*

**Ejemplo de mini-galería:**

| Pantalla de Login | Dashboard Principal |
| :-: | :-: |
| ![](docs/img/login.png) | ![](docs/img/dashboard.png) |

| Sección En Curso | Mi Biblioteca |
| :-: | :-: |
| ![](docs/img/en-curso.png) | ![](docs/img/biblioteca.png) |

> 💡 Tip: en Windows podés sacar screenshots con `Win + Shift + S`. Para capturar toda una página web: **F12 → Ctrl+Shift+P → "Capture full size screenshot"**.

---

## 🚧 Roadmap · Ideas para próximas versiones

- [ ] 🔌 **Integrar Google Books API**: búsqueda externa, auto-llenar portadas, ISBN y sinopsis
- [ ] 📈 **Estadísticas avanzadas** con gráficos (libros por mes, género favorito, páginas totales/año) · *(usar [Recharts](https://recharts.org/))*
- [ ] 📝 **Sección pública de reseñas**: perfil de usuario visible + ratings promedio
- [ ] 👥 **Sistema social**: seguir usuarios, ver sus bibliotecas, recomendaciones
- [ ] 📤 **Importar / Exportar** desde CSV / Goodreads / Whakoom
- [ ] 🌓 **Toggle tema oscuro / claro**
- [ ] 🖼️ **Subida de imágenes** de portada (en lugar de solo URL)
- [ ] 📱 **PWA** (agregar a pantalla de inicio, offline básico)
- [ ] 🚀 **Deploy**: Frontend en Vercel · Backend en Render/Railway · Migrar DB a PostgreSQL

---

## 🛠️ Scripts útiles

```powershell
# ===== BACKEND  =====
cd backend
pip install -r requirements.txt   # instalar
python seed_demo.py               # cargar datos demo
python run.py                     # iniciar dev server (p.5000)

# ===== FRONTEND =====
cd frontend
npm.cmd install                   # instalar dependencias
npm.cmd run dev                   # iniciar Vite (dev)
npm.cmd run build                 # build producción → /dist
npm.cmd run preview               # previsualizar build
```

---

## 📝 Notas sobre seguridad

- 🔐 Las **contraseñas NUNCA se guardan en texto plano** → se usan hashes con Werkzeug (`generate_password_hash` / `check_password_hash`)
- 🎟️ Tokens **JWT** separados: access (7 días) + refresh (30 días)
- 🔄 Axios en frontend tiene un **interceptor automático** que renueva el access token sin que el usuario lo note
- 🚫 Archivos `.env` con secretos están **ignorados por Git** (ver [.gitignore](file:///C:/Users/tobib/OneDrive%20-%20jbuckner/Escritorio/proyectos_personales/biblioteca/.gitignore))
- 📧 Validación de emails sintáctica con librería `email-validator`

---

## 🤝 Contribuciones

Este es un proyecto personal de portfolio, pero si encontrás un bug, querés proponer una mejora o usarlo como plantilla, ¡soy todo ojos! Podés:

1. Hacer **Fork** del repo
2. Crear una rama feature: `git checkout -b feature/nueva-funcion`
3. Commitear tus cambios: `git commit -m "feat: agrega X funcionalidad"`
4. Pushear a la rama: `git push origin feature/nueva-funcion`
5. Abrir un **Pull Request** y contame de qué se trata 💬

---

## 📜 Licencia

Este proyecto se distribuye bajo licencia **MIT**. Podes usarlo, modificarlo y distribuirlo libremente dando crédito al autor original. Ver archivo `LICENSE` para más detalles.

---

## 👨‍🎓 Autor

**Tobias Bruckner** · Estudiante de Analista de Sistemas

> **Portfolio**:   https://tu-portfolio.com  
> **GitHub**:      https://github.com/TobiBruckner
> **LinkedIn**:    www.linkedin.com/in/tobias-bruckner-703193303
> **Email**:       tobi.bruckner02@gmail.com

---

> ✨ *"Un libro es un sueño que tú haces realidad mientras lees."* — Neil Gaiman
