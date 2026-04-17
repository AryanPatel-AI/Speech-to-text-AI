from flask import Flask, request, jsonify, render_template
import os, uuid
from worker import transcribe_audio, celery

app = Flask(__name__)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD,exist_ok=True)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload",methods=["POST"])
def upload():
    if "audio" not in request.files or not request.files["audio"].filename:
        return jsonify({"error": "Audio file is required."}), 400

    file=request.files["audio"]
    job_id=str(uuid.uuid4())

    _, ext = os.path.splitext(file.filename)
    path=os.path.join(UPLOAD,job_id+ext)
    file.save(path)

    print("File received:", path) # DEBUG PRINT

    # --- Original asynchronous code ---
    task = transcribe_audio.delay(path)
    return jsonify({"job_id": task.id}), 202

@app.route("/status/<job_id>")
def status(job_id):
    try:
        task = celery.AsyncResult(job_id)
        if task.state == 'SUCCESS':
            return jsonify({"status": "done", "text": task.result})
        elif task.state in ['PENDING', 'STARTED', 'RETRY']:
            return jsonify({"status": "processing"})
        elif task.state in ['FAILURE', 'REVOKED']:
            # If the task failed, task.info contains the exception.
            # We convert it to a string to safely serialize it.
            return jsonify({"status": "failed", "error": str(task.info)})
        return jsonify({"status": task.state.lower()})
    except Exception as e:
        # If anything crashes while checking status, return a JSON error instead of a 500 HTML page
        return jsonify({"status": "failed", "error": f"An internal error occurred while checking task status: {str(e)}"}), 500

if __name__=="__main__":
    app.run(debug=True)
    