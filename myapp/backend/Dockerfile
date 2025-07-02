FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY load_initial_data.py /load_initial_data.py
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000", "--reload"]
