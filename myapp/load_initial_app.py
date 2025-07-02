# load_initial_data.py

import json
from pymongo import MongoClient
import os

# Conexión local a Mongo (puedes parametrizar si hace falta)
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["sophia_db"]

def load_json(file_path):
    with open(file_path, encoding="utf-8") as f:
        return json.load(f)

def insert_data(collection, data):
    if not data:
        return
    collection.delete_many({})  # limpia antes de insertar
    collection.insert_many(data)
    print(f"Insertados {len(data)} documentos en '{collection.name}'")

def main():
    print("⏳ Cargando datos iniciales...")

    base_path = os.path.join(os.path.dirname(__file__), "utils")

    asignaturas = load_json(os.path.join(base_path, "subjects.json"))
    usuarios = load_json(os.path.join(base_path, "users.json"))

    insert_data(db.subjects, asignaturas)
    insert_data(db.users, usuarios)

    print("✅ Carga completada")

if __name__ == "__main__":
    main()
