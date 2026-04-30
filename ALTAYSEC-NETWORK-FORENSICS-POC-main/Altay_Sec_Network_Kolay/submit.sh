#!/bin/bash

echo "================================================="
echo "    ALTAYSEC BLUE TEAM - NETWORK FORENSICS       "
echo "================================================="
echo "tshark ile evidence.pcap dosyasini analiz ettiysen"
echo "sorulara gecelim. Bayragi sadece analizciler alir!"
echo "-------------------------------------------------"

# Soru 1
read -p "1. Agda DNS tünelleme yaparak veri sizdiran cihazin IP adresi nedir? : " q1
if [ "$q1" != "10.0.0.15" ]; then
    echo " Yanlis! DNS (port 53) sorgularini gonderen IP'ye odaklan."
    exit 1
fi

# Soru 2
read -p "2. Veri sizintisi icin kullanilan sahte alan adini (domain) yaz: " q2
if [ "$q2" != "evil-c2.local" ]; then
    echo " Yanlis! tshark ile 'dns.qry.name' filtresini kullanmayi dene."
    exit 1
fi

# Soru 3
read -p "3. DNS paketleri icinde tasinan Base64 formatli sifreli veriyi bul: " q3
if [ "$q3" != "QUxUQVl7TjNUV09SS19GT1JFTlNJQ1NfTUFTVEVSfQ==" ]; then
    echo " Yanlis! Domain sorgularinin basindaki uzun karakter dizisini kopyala."
    exit 1
fi

# FLAG
echo ""
echo "ANALIZ TAMAMLANDI! Ag trafigi yalan soylemez."
echo "Iste Bayragin:"
echo "QUxUQVl7TjNUV09SS19GT1JFTlNJQ1NfTUFTVEVSfQ==" | base64 -d
echo ""
echo "================================================="