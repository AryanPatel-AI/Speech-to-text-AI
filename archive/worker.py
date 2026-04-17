from celery import Celery
import os
import whisper
 
# Ensure whisper can find the ffmpeg binary from homebrew
os.environ["PATH"] += os.pathsep + "/opt/homebrew/bin"

redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
celery=Celery("worker", broker=redis_url, backend=redis_url)
model = whisper.load_model("base")

@celery.task
def transcribe_audio(path):
    print("Processing:", path) # DEBUG PRINT

    try:
        result=model.transcribe(path)
        return result["text"]
    except Exception as e:
        # Print the error to the worker's terminal and raise it so Celery knows it failed
        print(f"Transcription failed with error: {str(e)}")
        raise e
    finally:
        # Ensure the uploaded file is removed after processing to prevent disk space issues.
        if os.path.exists(path):
            os.remove(path)