FROM ubuntu:22.04

# Gerekli araçlar (simülatör Python ile çalışıyor)
RUN apt-get update && apt-get install -y \
    bash \
    nano \
    ttyd \
    shc \
    gcc \
    dos2unix \
    python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/analyst

# Dosyaları içeri kopyala
COPY gorev_ozeti.txt .
COPY vol.py ./vol
COPY submit.sh .
# Dummy bir RAM imaj dosyası
RUN touch suspect.raw

# Windows CRLF sorunları
RUN dos2unix submit.sh vol
# Simülatöre çalışma izni
RUN chmod +x vol

# Sınav sistemi (Anti-Cheat)
RUN shc -f submit.sh -o submit
RUN rm submit.sh submit.sh.x.c
RUN chmod +x submit

# ALTAYSEC KIRMIZI TEMASI (Bash Prompt'u kırmızı ve beyaz yapıyoruz)
RUN echo "PS1='\[\e[1;31m\]AltaySec-Lab\[\e[0m\]:\[\e[1;37m\]\w\[\e[0m\]\$ '" >> /root/.bashrc

EXPOSE 8080

# TTYD Teması: Arkaplan Siyah, Yazılar Beyaz, İmleç Kırmızı!
CMD ["ttyd", "-t", "theme={\"background\":\"#0a0a0a\",\"foreground\":\"#ffffff\",\"cursor\":\"#ff0000\"}", "-t", "fontSize=20", "-W", "-p", "8080", "bash"]