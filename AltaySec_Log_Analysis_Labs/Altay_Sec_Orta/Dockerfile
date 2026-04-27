FROM ubuntu:22.04

RUN apt-get update && apt-get install -y wget curl nano grep gawk shc gcc && \
    wget https://github.com/yudai/gotty/releases/download/v1.0.1/gotty_linux_amd64.tar.gz && \
    tar -zxvf gotty_linux_amd64.tar.gz && \
    mv gotty /usr/local/bin/ && \
    rm gotty_linux_amd64.tar.gz

WORKDIR /home/analyst

COPY access.log /home/analyst/access.log
COPY submit.sh /home/analyst/submit.sh

RUN echo "LEVEL 2: SHELLSHOCK (CVE-2014-6271) \n\nGOREV: access.log dosyasini incele. \nKalabalik loglar arasinda Shellshock zafiyet desenini bul ve saldirganin adimlarini tespit et. \nHazir oldugunda './submit' komutunu calistir!" > gorev.txt && \
    sed -i 's/\r$//' /home/analyst/submit.sh && \
    shc -f /home/analyst/submit.sh -o /home/analyst/submit && \
    rm /home/analyst/submit.sh.x.c && \
    rm /home/analyst/submit.sh && \
    chmod +x /home/analyst/submit

EXPOSE 80

CMD ["gotty", "-w", "-p", "80", "bash"]