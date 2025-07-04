import os

class Config:
    # Conexión a MongoDB; por defecto usamos la base de datos "sophia_db"
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/sophia_db')
    # Clave secreta para firmar los tokens JWT
    # TODO : Cambiar esta clave en producción
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret')
