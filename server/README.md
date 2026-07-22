# Flask API starter

This folder is a starter backend for the React + Vite project.

## Run

```bash
cd server
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API will run at `http://127.0.0.1:5000/api`.

## Included endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/leads`
- `POST /api/onboarding`
- `GET /api/dashboard`

The starter writes demo submissions into `server/data/*.json`. Replace this with PostgreSQL/MySQL, JWT authentication, password hashing, validation, file storage, payments, email, and real service-provider integrations before production.
