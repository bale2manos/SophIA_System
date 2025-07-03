import os
from datetime import datetime
import bcrypt
from pymongo import MongoClient

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://mongo:27017/myapp')
client = MongoClient(MONGO_URI)
db = client.get_default_database()

# Clear collections
for col in ['users', 'subjects', 'resources', 'submissions']:
    db[col].delete_many({})

# Users
prof_hash = bcrypt.hashpw('prof123'.encode(), bcrypt.gensalt())
student_hash = bcrypt.hashpw('alum123'.encode(), bcrypt.gensalt())

db.users.insert_many([
    {
        'email': 'ana@uc3m.es',
        'name': 'Ana',
        'role': 'professor',
        'password_hash': prof_hash,
        'subject_codes': ['CS101', 'MA101'],
        'nip': 'P00000001'
    },
    {
        'email': 'maria@uc3m.es',
        'name': 'Maria',
        'role': 'student',
        'password_hash': student_hash,
        'subject_codes': ['CS101'],
        'nia': '100000001'
    }
])

# Subjects
subjects = [
    {
        'code': 'CS101',
        'title': 'Computer Science',
        'description': 'Introductory course',
        'professors': ['ana@uc3m.es']
    },
    {
        'code': 'MA101',
        'title': 'Mathematics',
        'description': 'Calculus basics',
        'professors': ['ana@uc3m.es']
    }
]

db.subjects.insert_many(subjects)

# Resources
resources = [
    {
        'subject_code': 'CS101',
        'title': 'Lecture 1',
        'type': 'lecture',
        'description': 'Introduction',
        'attachments': [],
        'created_by': 'ana@uc3m.es',
        'created_at': datetime.utcnow(),
        'due_date': None
    },
    {
        'subject_code': 'CS101',
        'title': 'Practice 1',
        'type': 'practice',
        'description': 'First practice',
        'attachments': [],
        'created_by': 'ana@uc3m.es',
        'created_at': datetime.utcnow(),
        'due_date': None
    },
    {
        'subject_code': 'MA101',
        'title': 'Exercise 1',
        'type': 'exercise',
        'description': 'Homework',
        'attachments': [],
        'created_by': 'ana@uc3m.es',
        'created_at': datetime.utcnow(),
        'due_date': None
    }
]

if resources:
    db.resources.insert_many(resources)

print('Demo data loaded')
