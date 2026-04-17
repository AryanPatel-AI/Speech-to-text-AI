#!/bin/bash
# Start all services needed for Speech-to-Text AI

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$PROJECT_DIR/venv/bin"

echo "🚀 Starting Speech-to-Text AI..."

# 1. Start Redis
echo "▶ Starting Redis..."
/opt/homebrew/bin/redis-server --daemonize yes --logfile /tmp/redis-stt.log
sleep 1
if /opt/homebrew/bin/redis-cli ping | grep -q PONG; then
    echo "  ✅ Redis is running"
else
    echo "  ❌ Redis failed to start. Check /tmp/redis-stt.log"
    exit 1
fi

# 2. Start Celery worker in background
echo "▶ Starting Celery worker..."
$VENV/celery -A worker.celery worker --loglevel=info \
    --logfile=/tmp/celery-stt.log --detach
sleep 2
echo "  ✅ Celery worker started (logs: /tmp/celery-stt.log)"

# 3. Start Flask app
echo "▶ Starting Flask on http://127.0.0.1:5001 ..."
echo "  ✅ Open http://127.0.0.1:5001 in your browser"
echo ""
$VENV/python3.14 "$PROJECT_DIR/app.py"
