import os

class Config:
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://mongo:27017/myapp')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'super-secret')
