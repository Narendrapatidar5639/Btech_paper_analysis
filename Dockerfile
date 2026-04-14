FROM python:3.11-slim
# ... (apt-get install wala part same rahega)

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pura code copy karo
COPY . .

ENV PORT=7860
EXPOSE 7860

# Sabse important: Gunicorn aur Migration ko batao ki manage.py kahan hai
CMD ["sh", "-c", "python mainproject/manage.py migrate && gunicorn --chdir mainproject mainproject.wsgi:application --bind 0.0.0.0:7860 --timeout 300"]