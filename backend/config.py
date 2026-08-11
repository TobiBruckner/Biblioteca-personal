import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

    raw_db_uri = os.getenv('DATABASE_URL', 'sqlite:///biblioteca.db')
    if raw_db_uri.startswith('postgres://'):
        raw_db_uri = raw_db_uri.replace('postgres://', 'postgresql+psycopg://', 1)
    elif raw_db_uri.startswith('postgresql://'):
        raw_db_uri = raw_db_uri.replace('postgresql://', 'postgresql+psycopg://', 1)
    elif raw_db_uri.startswith('postgresql+psycopg2://'):
        raw_db_uri = raw_db_uri.replace('postgresql+psycopg2://', 'postgresql+psycopg://', 1)
    SQLALCHEMY_DATABASE_URI = raw_db_uri

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-dev-secret')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    CORS_HEADERS = 'Content-Type, Authorization'
    CORS_SUPPORTS_CREDENTIALS = True

    raw_origins = os.getenv('CORS_ORIGINS', '*')
    if raw_origins.strip() == '*':
        CORS_ORIGINS = '*'
    else:
        CORS_ORIGINS = [
            o.strip() for o in raw_origins.split(',')
            if o.strip()
        ]
