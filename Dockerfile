FROM python:3.11-slim

# System dependencies (Updated for Debian Trixie/Slim compatibility)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Requirements install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files
COPY . .

# Hugging Face fixed port
ENV PORT=7860
EXPOSE 7860

# Django startup command
CMD ["sh", "-c", "python manage.py migrate && gunicorn mainproject.wsgi:application --bind 0.0.0.0:7860 --timeout 300"]