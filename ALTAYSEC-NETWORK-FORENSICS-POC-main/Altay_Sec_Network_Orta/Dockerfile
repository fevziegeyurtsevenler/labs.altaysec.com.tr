FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    wget curl nano grep gawk shc gcc tshark python3 python3-pip python3-scapy vim-common && \
    wget https://github.com/yudai/gotty/releases/download/v1.0.1/gotty_linux_amd64.tar.gz && \
    tar -zxvf gotty_linux_amd64.tar.gz && \
    mv gotty /usr/local/bin/ && \
    rm gotty_linux_amd64.tar.gz

WORKDIR /home/analyst

COPY submit.sh /home/analyst/submit.sh

# Görev dosyası ve submit scripti
RUN echo "LEVEL 2: ICMP EXFILTRATION (ORTA) \n\nGOREV: \nGuvenlik duvarindan sadece ICMP (ping) paketlerinin gecisine izin veriliyor. \nSaldirganin bu zafiyeti kullanarak hangi IP'ye, ne tur bir veri sizdirdigini 'tshark' ile bul. \n\nIpuclari: \n- tshark -r evidence.pcap -Y 'icmp' \n- Paketlerin icindeki 'data' kismina odaklan! ( tshark -r evidence.pcap -Y 'icmp' -x ) \n\nHazir oldugunda './submit' calistir." > gorev.txt && \
    sed -i 's/\r$//' /home/analyst/submit.sh && \
    shc -f /home/analyst/submit.sh -o /home/analyst/submit && \
    rm /home/analyst/submit.sh.x.c && rm /home/analyst/submit.sh && \
    chmod +x /home/analyst/submit

# SCAPY ile PCAP uretimi
RUN echo "from scapy.all import *\n\
pkts = [\n\
    IP(src='192.168.1.10', dst='8.8.8.8')/ICMP(type=8)/Raw(load='abcdefghijklmnopqrstuvwabcdefghi'),\n\
    IP(src='8.8.8.8', dst='192.168.1.10')/ICMP(type=0)/Raw(load='abcdefghijklmnopqrstuvwabcdefghi'),\n\
    IP(src='10.0.0.55', dst='172.16.0.200')/ICMP(type=8)/Raw(load='EXFIL_DATA:QUxUQVl7UElORzBfSUNNUF9FWEZJTH0='),\n\
    IP(src='192.168.1.12', dst='8.8.4.4')/ICMP(type=8)/Raw(load='abcdefghijklmnopqrstuvwabcdefghi')\n\
]\n\
wrpcap('evidence.pcap', pkts)" > gen_pcap.py && \
    python3 gen_pcap.py && rm gen_pcap.py

EXPOSE 80

CMD ["gotty", "-w", "-p", "80", "bash"]