from flask import Flask, request, jsonify, render_template
import os
import uuid
import threading
import traceback
import whisper

os.environ["PATH"] += os.pathsep + "/opt/homebrew/bin"

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD, exist_ok=True)

# In-memory dictionary to store job statuses
# Format: { "job_id": {"status": "processing" | "done" | "failed", "text": "...", "error": "..."} }
jobs = {}

# We'll load the whisper model once globally
model = None

def load_model():
    global model
    if model is None:
        print("Loading Whisper model (base)...")
        model = whisper.load_model("base")
        print("Model loaded.")

def process_audio(job_id, path):
    global jobs, model
    try:
        load_model()
        print(f"Processing job {job_id} for file {path}")
        result = model.transcribe(path)
        
        # Save success state
        jobs[job_id]["status"] = "done"
        jobs[job_id]["text"] = result["text"]
    except Exception as e:
        print(f"Transcription failed for job {job_id}: {e}")
        traceback.print_exc()
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
    finally:
        # Cleanup audio file explicitly after completion
        if os.path.exists(path):
            os.remove(path)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    global jobs
    
    if "audio" not in request.files or not request.files["audio"].filename:
        return jsonify({"error": "Audio file is required."}), 400

    file = request.files["audio"]
    job_id = str(uuid.uuid4())
    _, ext = os.path.splitext(file.filename)
    path = os.path.join(UPLOAD, job_id + ext)
    
    file.save(path)
    
    # Initialize job state
    jobs[job_id] = {"status": "processing"}
    
    # Start transcription in the background
    thread = threading.Thread(target=process_audio, args=(job_id, path))
    thread.start()
    
    return jsonify({"job_id": job_id}), 202

@app.route("/status/<job_id>")
def status(job_id):
    if job_id not in jobs:
        return jsonify({"status": "failed", "error": "Job ID not found"}), 404
        
    return jsonify(jobs[job_id])

if __name__ == "__main__":
    app.run(debug=True, port=5001)
