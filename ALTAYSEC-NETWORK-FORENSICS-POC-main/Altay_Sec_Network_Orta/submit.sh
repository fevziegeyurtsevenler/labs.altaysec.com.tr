#!/bin/bash

echo "================================================="
echo "    ALTAYSEC BLUE TEAM - ICMP FORENSICS          "
echo "================================================="
echo "tshark ile evidence.pcap dosyasini analiz ettiysen"
echo "sorulara gecelim."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Anormal veri (payload) tasiyan ICMP paketinin gittigi Hedef (C2) IP adresi nedir? : " q1
if [ "$q1" != "172.16.0.200" ]; then
    echo " Yanlis! Digerlerinden farkli bir IP'ye giden ping istegine bak."
    exit 1
fi

# Soru 2
read -p "2. ICMP paketinin data kisminda (load) tasinan Base64 metni tam olarak nedir? (Sadece Base64 kismini yaz) : " q2
if [ "$q2" != "QUxUQVl7UElORzBfSUNNUF9FWEZJTH0=" ]; then
    echo " Yanlis! tshark -x ile paketin icerigini okumalisin. EXFIL_DATA: kismini alma."
    exit 1
fi

# FLAG
echo ""
echo " HARIKA TESPIT! Ping paketleri icindeki tüneli yiktin gectin."
echo "Iste Bayragin:"
echo "QUxUQVl7UElORzBfSUNNUF9FWEZJTH0=" | base64 -d
echo ""
echo "================================================="