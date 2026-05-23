# Hafif bir Python imajı kullanıyoruz
FROM python:3.9-slim

# Çalışma dizinini belirliyoruz
WORKDIR /app

# Gerekli kütüphaneyi yüklüyoruz
RUN pip install flask

# Dosyaları Docker'ın içine kopyalıyoruz
COPY . .

# Flask'ın çalışacağı portu dışarı açıyoruz
EXPOSE 5000

# Uygulamayı başlatıyoruz
CMD ["python", "app.py"]