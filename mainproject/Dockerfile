# Python image ka use karein
FROM python:3.11-slim

# System dependencies (Docling aur PDF processing ke liye zaroori)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Work directory set karein
WORKDIR /app

# Requirements install karein
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pura code copy karein
COPY . .

# Port 7860 use karna hota hai Hugging Face ke liye
ENV PORT=7860
EXPOSE 7860

# Gunicorn se app start karein
CMD ["sh", "-c", "python manage.py migrate && gunicorn mainproject.wsgi:application --bind 0.0.0.0:7860 --timeout 300"]