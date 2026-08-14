# WSGI entry point for Hostinger's hPanel "Python App" feature (Phusion
# Passenger) this is the standard, documented way to run a Flask app on
# Hostinger's Business/Premium/Cloud shared-hosting plans without a VPS.
# Passenger imports this file and looks for a module-level `application`
# callable by convention it does not run `python run.py` itself.
#
# hPanel setup (Websites → your domain → Advanced → Python App):
#   1. "Application root"    -> the directory this file lives in (server/)
#   2. "Application startup file" -> passenger_wsgi.py
#   3. "Application Entry point" / callable -> application
#   4. Set every required environment variable from
#      ../docs/environment-reference.md in the app's "Environment variables"
#      panel (FLASK_ENV=production, SECRET_KEY, JWT_SECRET_KEY,
#      FRONTEND_ORIGIN, DATABASE_URL, etc.) hPanel's Python App UI does
#      not read server/.env automatically.
#   5. hPanel installs server/requirements.txt into its own managed
#      virtualenv when you click "Run pip install" re-run that any time
#      requirements.txt changes.
#   6. hPanel assigns this app its own URL (e.g. a subdomain like
#      api.americanbusinessformations.com, or a /api path depending on
#      plan). Whichever it is, set the FRONTEND's VITE_API_URL to that
#      real address and rebuild the frontend see
#      docs/deployment-checklist.md, "API routing / reverse proxy".
#
# If your plan does not offer "Python App" (pure shared hosting), this file
# is unused deploy the backend to a host that can run a persistent Python
# process instead (Hostinger VPS/Cloud, Render, Railway, Fly.io, a small
# VPS) per docs/deployment-checklist.md.
from app import create_app

application = create_app()
