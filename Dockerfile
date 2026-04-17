FROM python:3.11-slim

# Install system dependencies including ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces require running as a non-root user
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app
COPY --chown=user . /app

# Install python dependencies
RUN pip install --no-cache-dir -r requirement.txt

# Expose HF default port
EXPOSE 7860

# Start Flask
CMD ["python", "app.py"]
