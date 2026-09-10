import os
from app import app, db, Job, process_audio_task
import uuid

def test_db_persistence():
    print("Testing Database Persistence...")
    with app.app_context():
        test_id = str(uuid.uuid4())
        new_job = Job(id=test_id, filename="test.mp3", status="done", text="This is a test.")
        db.session.add(new_job)
        db.session.commit()
        
        job = Job.query.get(test_id)
        if job and job.text == "This is a test.":
            print("✅ Database persistence working.")
            db.session.delete(job)
            db.session.commit()
        else:
            print("❌ Database persistence failed.")

def test_celery_config():
    print("Testing Celery Configuration...")
    broker = app.config['CELERY_BROKER_URL']
    print(f"Broker: {broker}")
    if "redis://" in broker:
        print("✅ Celery broker configured correctly.")
    else:
        print("❌ Celery broker misconfigured.")

if __name__ == "__main__":
    test_db_persistence()
    test_celery_config()
    print("\nNext Steps:")
    print("1. Start Redis server.")
    print("2. Run Celery worker: 'celery -A app.celery worker --loglevel=info'")
    print("3. Run Flask app: 'python app.py'")
