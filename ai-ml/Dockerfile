# SolChain AI/ML Service Dockerfile
# Use Python 3.13 with PyTorch CPU wheels
FROM python:3.13-slim-bookworm

# Upgrade pip and system packages to reduce vulnerabilities
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends build-essential unzip && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --upgrade pip

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Unzip data.zip and overwrite if the folder already exists
RUN rm -rf data && unzip data.zip -d data

EXPOSE 5000

CMD ["python", "app.py"]
