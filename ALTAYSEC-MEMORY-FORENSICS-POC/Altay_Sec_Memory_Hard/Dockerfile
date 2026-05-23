FROM ubuntu:22.04

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

COPY gorev_ozeti.txt .
COPY vol.py ./vol
COPY submit.sh .
RUN touch suspect.raw

RUN dos2unix submit.sh vol
RUN chmod +x vol

RUN shc -f submit.sh -o submit
RUN rm submit.sh submit.sh.x.c
RUN chmod +x submit

RUN echo "PS1='\[\e[1;31m\]AltaySec-Lab\[\e[0m\]:\[\e[1;37m\]\w\[\e[0m\]\$ '" >> /root/.bashrc

EXPOSE 8080

CMD ["ttyd", "-t", "theme={\"background\":\"#0a0a0a\",\"foreground\":\"#ffffff\",\"cursor\":\"#ff0000\"}", "-t", "fontSize=20", "-W", "-p", "8080", "bash"]