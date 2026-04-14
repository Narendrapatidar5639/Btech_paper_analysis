FROM python:3.11-slim

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

# Yeh line Python ko folder dhundne mein madad karegi
ENV PYTHONPATH=/app/mainproject:/app

ENV PORT=7860
EXPOSE 7860

# Is command mein thoda change (wsgi ka path verify karein)
CMD ["sh", "-c", "python manage.py migrate && gunicorn --chdir mainproject mainproject.wsgi:application --bind 0.0.0.0:7860 --timeout 300"]