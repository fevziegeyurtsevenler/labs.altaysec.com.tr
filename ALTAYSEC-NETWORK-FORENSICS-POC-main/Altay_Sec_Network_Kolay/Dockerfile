FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# python3-scapy paketi (Gerçek ağ paketleri üretmek için)
RUN apt-get update && apt-get install -y \
    wget curl nano grep gawk shc gcc tshark python3 python3-pip python3-scapy vim-common && \
    wget https://github.com/yudai/gotty/releases/download/v1.0.1/gotty_linux_amd64.tar.gz && \
    tar -zxvf gotty_linux_amd64.tar.gz && \
    mv gotty /usr/local/bin/ && \
    rm gotty_linux_amd64.tar.gz

WORKDIR /home/analyst

COPY submit.sh /home/analyst/submit.sh

# Görev dosyası ve submit scripti
RUN echo "LEVEL: NETWORK FORENSICS (KOLAY) \n\nGOREV: \nSirket agindan disariya gizli veri sizdirildigi tespit edildi. \n'evidence.pcap' dosyasini 'tshark' kullanarak analiz et. \n\nIpuclari: \n- tshark -r evidence.pcap \n- DNS trafigini filtrele: -Y 'dns' \n\nHazir oldugunda './submit' calistir." > gorev.txt && \
    sed -i 's/\r$//' /home/analyst/submit.sh && \
    shc -f /home/analyst/submit.sh -o /home/analyst/submit && \
    rm /home/analyst/submit.sh.x.c && rm /home/analyst/submit.sh && \
    chmod +x /home/analyst/submit

# GERÇEK PCAP DOSYASINI SCAPY İLE ÜRETME ADIMI
RUN echo "from scapy.all import *\n\
pkts = [\n\
    IP(src='192.168.1.5', dst='8.8.8.8')/UDP(dport=53)/DNS(rd=1, qd=DNSQR(qname='www.google.com')),\n\
    IP(src='10.0.0.50', dst='1.1.1.1')/UDP(dport=53)/DNS(rd=1, qd=DNSQR(qname='api.weather.com')),\n\
    IP(src='10.0.0.15', dst='10.0.0.2')/UDP(dport=53)/DNS(rd=1, qd=DNSQR(qname='QUxUQVl7TjNUV09SS19GT1JFTlNJQ1NfTUFTVEVSfQ==.evil-c2.local')),\n\
    IP(src='192.168.1.12', dst='8.8.4.4')/UDP(dport=53)/DNS(rd=1, qd=DNSQR(qname='update.microsoft.com'))\n\
]\n\
wrpcap('evidence.pcap', pkts)" > gen_pcap.py && \
    python3 gen_pcap.py && rm gen_pcap.py

EXPOSE 80

CMD ["gotty", "-w", "-p", "80", "bash"]