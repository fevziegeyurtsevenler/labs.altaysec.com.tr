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
RUN echo "LEVEL 3: FTP BRUTE FORCE & EXFILTRATION (ZOR) \n\nGOREV: \nSirketin FTP sunucusuna kaba kuvvet saldirisi yapildi ve kritik bir dosya indirildi. \n'evidence.pcap' dosyasini tshark ile analiz et. \n\nIpuclari: \n- tshark -r evidence.pcap -Y 'tcp.port==21' (Tum kontrol trafigi ve parolalar icin) \n- tshark -r evidence.pcap -Y 'ftp-data' -x (Veri transferi icin) \n\nHazir oldugunda './submit' calistir." > gorev.txt && \
    sed -i 's/\r$//' /home/analyst/submit.sh && \
    shc -f /home/analyst/submit.sh -o /home/analyst/submit && \
    rm /home/analyst/submit.sh.x.c && rm /home/analyst/submit.sh && \
    chmod +x /home/analyst/submit

# SCAPY ile FTP TCP Stream Üretimi
RUN echo 'from scapy.all import *' > gen_pcap.py && \
    echo 'src = "192.168.1.100"' >> gen_pcap.py && \
    echo 'dst = "10.0.0.5"' >> gen_pcap.py && \
    echo 'pkts = [' >> gen_pcap.py && \
    echo '    IP(src=src, dst=dst)/TCP(sport=45000, dport=21, flags="PA")/Raw(load="USER admin\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=dst, dst=src)/TCP(sport=21, dport=45000, flags="PA")/Raw(load="331 Password required\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=src, dst=dst)/TCP(sport=45000, dport=21, flags="PA")/Raw(load="PASS 12345\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=dst, dst=src)/TCP(sport=21, dport=45000, flags="PA")/Raw(load="530 Login incorrect\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=src, dst=dst)/TCP(sport=45001, dport=21, flags="PA")/Raw(load="USER administrator\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=dst, dst=src)/TCP(sport=21, dport=45001, flags="PA")/Raw(load="331 Password required\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=src, dst=dst)/TCP(sport=45001, dport=21, flags="PA")/Raw(load="PASS P@ssw0rd2026!\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=dst, dst=src)/TCP(sport=21, dport=45001, flags="PA")/Raw(load="230 User logged in\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=src, dst=dst)/TCP(sport=45001, dport=21, flags="PA")/Raw(load="RETR confidential_data.zip\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=dst, dst=src)/TCP(sport=21, dport=45001, flags="PA")/Raw(load="150 Opening data connection.\\r\\n"),' >> gen_pcap.py && \
    echo '    IP(src=dst, dst=src)/TCP(sport=20, dport=45002, flags="PA")/Raw(load="PK_HEADER... QUxUQVl7RlRQX0JSVVQzX0FORF9FWEZJTF9DNEVHSFR9"),' >> gen_pcap.py && \
    echo '    IP(src=dst, dst=src)/TCP(sport=21, dport=45001, flags="PA")/Raw(load="226 Transfer complete.\\r\\n")' >> gen_pcap.py && \
    echo ']' >> gen_pcap.py && \
    echo 'wrpcap("evidence.pcap", pkts)' >> gen_pcap.py && \
    python3 gen_pcap.py && rm gen_pcap.py

EXPOSE 80

CMD ["gotty", "-w", "-p", "80", "bash"]