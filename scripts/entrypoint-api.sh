#!/bin/sh
set -e
python -m api.migrate
exec uvicorn api.index:app --host 0.0.0.0 --port 8000
