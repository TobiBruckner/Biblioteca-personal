from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)

    cors_opts = {
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', '*'),
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
            "allow_headers": [
                "Content-Type",
                "Authorization",
                "X-Requested-With",
                "Accept",
                "Origin"
            ],
            "expose_headers": ["Authorization"],
            "supports_credentials": True
        }
    }
    cors.init_app(app, resources=cors_opts)

    from app.models import Usuario, Libro, EstadoLectura

    with app.app_context():
        db.create_all()

    from app.auth.routes import auth_bp
    from app.libros.routes import libros_bp
    from app.usuarios.routes import usuarios_bp
    from app.main.routes import main_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(libros_bp, url_prefix='/api/libros')
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    app.register_blueprint(main_bp, url_prefix='/api')

    return app
