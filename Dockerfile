FROM python:3.11-slim

# Install system dependencies including ffmpeg and redis-server
RUN apt-get update && apt-get install -y \
    ffmpeg \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces require running as a non-root user
RUN useradd -m -u 1000 user
WORKDIR /app

# Copy all files and set ownership
COPY --chown=user . /app

# Install python dependencies
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirement.txt

# Create necessary directories and set permissions
RUN mkdir -p /app/uploads /app/instance && chown -R user:user /app
RUN chmod +x /app/entrypoint.sh

USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Expose HF default port
EXPOSE 7860

# Start everything using the entrypoint script
CMD ["/app/entrypoint.sh"]
