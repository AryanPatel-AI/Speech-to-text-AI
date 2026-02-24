from flask import Flask, request, jsonify, render_template
import os, uuid
from worker import transcribe_audio
from state import jobs

app = Flask(__name__)
UPLOAD="uploads"
os.makedirs(UPLOAD,exist_ok=True)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload",methods=["POST"])
def upload():
    file=request.files["audio"]
    job_id=str(uuid.uuid4())

    path=os.path.join(UPLOAD,job_id+".wav")
    file.save(path)

    jobs[job_id]={"status":"processing"}

    transcribe_audio.delay(job_id,path)

    return jsonify({"job_id":job_id})

@app.route("/status/<job_id>")
def status(job_id):
    return jsonify(jobs.get(job_id,{"status":"not found"}))

if __name__=="__main__":
    app.run(debug=True)