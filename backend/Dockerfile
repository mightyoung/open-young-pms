FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create uploads and data directories
RUN mkdir -p uploads data

EXPOSE 8001

ENV USE_SQLITE=false
ENV DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/pms

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
