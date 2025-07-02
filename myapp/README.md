# MyApp

This project contains a Flask backend, React frontend, MongoDB database and NGINX reverse proxy.

## Development setup

1. Install Docker and Docker Compose.
2. Run `docker-compose up --build` inside the `myapp` directory.
3. The React app will be available at `http://localhost` and API under `http://localhost/api`.

The backend reloads automatically with `flask run --reload`.

Login with any username/password. Subjects are fetched from MongoDB.

```bash
# Seed demo data (subjects, users, resources)
docker compose exec backend python /app/../load_initial_data.py

# Demo credentials
# Professor: ana@uc3m.es / prof123
# Student  : maria@uc3m.es / alum123
```
