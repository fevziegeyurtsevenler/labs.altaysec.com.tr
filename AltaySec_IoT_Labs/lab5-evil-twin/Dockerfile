FROM python:3.11-alpine AS builder
WORKDIR /app
RUN pip install --no-cache-dir flask==3.0.0 --target=/app/deps

FROM python:3.11-alpine
WORKDIR /app
COPY --from=builder /app/deps /app/deps
COPY app.py index.html success.html admin.html panel.html ./
ENV PYTHONPATH=/app/deps
ENV PYTHONUNBUFFERED=1
EXPOSE 8085
CMD ["python", "app.py"]
