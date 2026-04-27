#!/bin/bash

# Start Redis in the background
echo "Starting Redis server..."
redis-server --port 6379 --dir /tmp --dbfilename dump.rdb &

# Wait for Redis to be ready
until redis-cli ping >/dev/null 2>&1; do
  echo "Waiting for Redis to wake up..."
  sleep 1
done

# Start Celery worker in the background
echo "Starting Celery worker..."
celery -A app.celery worker --loglevel=info &

# Start Flask app (this will be the main process)
echo "Starting Flask application..."
python app.py
