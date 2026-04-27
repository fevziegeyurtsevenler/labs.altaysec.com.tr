FROM ubuntu:22.04

RUN apt-get update && apt-get install -y wget curl nano grep gawk shc gcc && \
    wget https://github.com/yudai/gotty/releases/download/v1.0.1/gotty_linux_amd64.tar.gz && \
    tar -zxvf gotty_linux_amd64.tar.gz && \
    mv gotty /usr/local/bin/ && \
    rm gotty_linux_amd64.tar.gz

WORKDIR /home/analyst

COPY access.log /home/analyst/access.log
COPY system_audit.log /home/analyst/system_audit.log
COPY submit.sh /home/analyst/submit.sh

RUN echo "LEVEL 3: WEB TO OS STEALTH (KORELASYON) \n\nGOREV: \n1- access.log icindeki web trafigini incele ve saldiriyi baslatan araci/dosyayi bul. \n2- system_audit.log dosyasina gecis yap ve saldirganin sistemde calistirdigi komutlari tespit et. \n3- Veri sizintisini (exfiltration) yakala! \n\nHazir oldugunda './submit' calistir." > gorev.txt && \
    sed -i 's/\r$//' /home/analyst/submit.sh && \
    shc -f /home/analyst/submit.sh -o /home/analyst/submit && \
    rm /home/analyst/submit.sh.x.c && \
    rm /home/analyst/submit.sh && \
    chmod +x /home/analyst/submit

EXPOSE 80

CMD ["gotty", "-w", "-p", "80", "bash"]