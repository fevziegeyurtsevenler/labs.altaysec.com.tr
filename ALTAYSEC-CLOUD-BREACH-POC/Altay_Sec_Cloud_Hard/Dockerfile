FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    bash \
    jq \
    grep \
    nano \
    ttyd \
    shc \
    gcc \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/analyst

COPY cloudtrail_hard.json .
COPY gorev_ozeti.txt .
COPY submit.sh .

RUN dos2unix submit.sh
RUN shc -f submit.sh -o submit

RUN rm submit.sh submit.sh.x.c
RUN chmod +x submit

EXPOSE 8080

CMD ["ttyd", "-t", "fontSize=20", "-W", "-p", "8080", "bash"]