from celery import Celery
import whisper
import os
from state import jobs

celery=Celery("tasks",broker="redis://localhost:6379/0")

model=whisper.load_model("base")

@celery.task
def transcribe_audio(job_id,path):
    result=model.transcribe(path)

    jobs[job_id]={
        "status":"done",
        "text":result["text"]
    }

    os.remove(path)