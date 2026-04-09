FROM python:3.10-slim

WORKDIR /app

# Dependencies install karein
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pura code copy karein
COPY . .

# Django ko run karne ke liye
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]