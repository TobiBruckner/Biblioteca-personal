from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

ESTADO_LECTURA = {
    'EN_CURSO': 'en_curso',
    'LEIDO': 'leido',
    'QUIERO_LEER': 'quiero_leer'
}

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    nombre_completo = db.Column(db.String(150))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    libros = db.relationship('EstadoLectura', backref='usuario', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'nombre_completo': self.nombre_completo,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Libro(db.Model):
    __tablename__ = 'libros'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    autor = db.Column(db.String(255), nullable=False)
    isbn = db.Column(db.String(20), unique=True)
    genero = db.Column(db.String(100))
    sinopsis = db.Column(db.Text)
    paginas = db.Column(db.Integer)
    anio_publicacion = db.Column(db.Integer)
    editorial = db.Column(db.String(150))
    portada_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    estados = db.relationship('EstadoLectura', backref='libro', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'autor': self.autor,
            'isbn': self.isbn,
            'genero': self.genero,
            'sinopsis': self.sinopsis,
            'paginas': self.paginas,
            'anio_publicacion': self.anio_publicacion,
            'editorial': self.editorial,
            'portada_url': self.portada_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class EstadoLectura(db.Model):
    __tablename__ = 'estados_lectura'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    libro_id = db.Column(db.Integer, db.ForeignKey('libros.id'), nullable=False)
    estado = db.Column(db.String(20), nullable=False, default=ESTADO_LECTURA['QUIERO_LEER'])
    paginas_leidas = db.Column(db.Integer, default=0)
    calificacion = db.Column(db.Float)
    resena = db.Column(db.Text)
    favorito = db.Column(db.Boolean, default=False)
    fecha_inicio = db.Column(db.Date)
    fecha_fin = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('usuario_id', 'libro_id', name='uq_usuario_libro'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'libro_id': self.libro_id,
            'estado': self.estado,
            'paginas_leidas': self.paginas_leidas,
            'calificacion': self.calificacion,
            'resena': self.resena,
            'favorito': self.favorito,
            'fecha_inicio': self.fecha_inicio.isoformat() if self.fecha_inicio else None,
            'fecha_fin': self.fecha_fin.isoformat() if self.fecha_fin else None,
            'libro': self.libro.to_dict() if self.libro else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
