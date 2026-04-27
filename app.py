from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from celery import Celery
from dotenv import load_dotenv
import os
import uuid
import traceback
import whisper
from datetime import datetime

# Load environment variables
load_dotenv()

# Add homebrew to path if we're on a Mac local dev environment
if os.path.exists("/opt/homebrew/bin"):
    os.environ["PATH"] += os.pathsep + "/opt/homebrew/bin"

app = Flask(__name__)

# --- Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///transcriptions.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CELERY_BROKER_URL'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
app.config['CELERY_RESULT_BACKEND'] = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD, exist_ok=True)

# --- Extensions ---
db = SQLAlchemy(app)

def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery(app)

# --- Database Models ---
class Job(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(20), default='processing') # processing, done, failed
    text = db.Column(db.Text, nullable=True)
    error = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create tables
with app.app_context():
    db.create_all()

# --- Whisper Model ---
model = None

def load_model():
    global model
    if model is None:
        print("Loading Whisper model (base)...")
        model = whisper.load_model("base")
        print("Model loaded.")

# --- Celery Tasks ---
@celery.task(name='app.process_audio_task')
def process_audio_task(job_id, path):
    global model
    try:
        load_model()
        print(f"Processing job {job_id} for file {path}")
        result = model.transcribe(path)
        
        # Update DB on success
        job = Job.query.get(job_id)
        if job:
            job.status = "done"
            job.text = result["text"]
            db.session.commit()
            
    except Exception as e:
        print(f"Transcription failed for job {job_id}: {e}")
        traceback.print_exc()
        job = Job.query.get(job_id)
        if job:
            job.status = "failed"
            job.error = str(e)
            db.session.commit()
    finally:
        # Cleanup audio file
        if os.path.exists(path):
            os.remove(path)

# --- Routes ---
@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/app")
def home():
    return render_template("index.html")

@app.route("/history")
def history():
    jobs = Job.query.order_by(Job.created_at.desc()).limit(10).all()
    return render_template("history.html", jobs=jobs)

@app.route("/upload", methods=["POST"])
def upload():
    if "audio" not in request.files or not request.files["audio"].filename:
        return jsonify({"error": "Audio file is required."}), 400

    file = request.files["audio"]
    job_id = str(uuid.uuid4())
    _, ext = os.path.splitext(file.filename)
    path = os.path.join(UPLOAD, job_id + ext)
    
    file.save(path)
    
    # Create DB record
    new_job = Job(id=job_id, filename=file.filename)
    db.session.add(new_job)
    db.session.commit()
    
    # Start transcription in Celery
    process_audio_task.delay(job_id, path)
    
    return jsonify({"job_id": job_id}), 202

@app.route("/status/<job_id>")
def status(job_id):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"status": "failed", "error": "Job ID not found"}), 404
        
    return jsonify({
        "status": job.status,
        "text": job.text,
        "error": job.error,
        "created_at": job.created_at.isoformat() if job.created_at else None
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=True)
