#!/bin/bash

echo "================================================="
echo "    ALTAYSEC BLUE TEAM - FTP FORENSICS           "
echo "================================================="
echo "Saldirganin FTP adimlarini tshark ile cozduysen"
echo "asagidaki sorulara dikkatle cevap ver."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Saldirganin FTP sunucusuna basarili giris yaptigi kullanici adi ve parolasi nedir? (Format: kullanici:parola) : " q1
if [ "$q1" != "administrator:P@ssw0rd2026!" ]; then
    echo " Yanlis! 230 donen basarili giris (PASS) komutuna bak."
    exit 1
fi

# Soru 2
read -p "2. Saldirganin sunucudan indirdigi (RETR) gizli dosyanin tam adi nedir? : " q2
if [ "$q2" != "confidential_data.zip" ]; then
    echo " Yanlis! RETR komutunun yanindaki dosya adini incele."
    exit 1
fi

# Soru 3
read -p "3. Indirilen verinin (ftp-data) icindeki Base64 formatli gizli metin nedir? : " q3
if [ "$q3" != "QUxUQVl7RlRQX0JSVVQzX0FORF9FWEZJTF9DNEVHSFR9" ]; then
    echo " Yanlis! 'tshark -Y ftp-data -x' kullanarak paketin icini okumalisin."
    exit 1
fi

# FLAG
echo ""
echo " KUSURSUZ DFIR ANALIZI! Saldirgani adim adim haritaladin."
echo "Iste Bayragin:"
echo "QUxUQVl7RlRQX0JSVVQzX0FORF9FWEZJTF9DNEVHSFR9" | base64 -d
echo ""
echo "================================================="