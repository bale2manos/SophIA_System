import os

class Config:
    MONGO_URI = os.environ.get(
        'MONGO_URI',
        'mongodb://mongo:27017/sophia_db'
    )
