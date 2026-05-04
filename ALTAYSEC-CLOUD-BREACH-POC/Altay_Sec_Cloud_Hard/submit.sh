#!/bin/bash

echo "================================================="
echo "     ALTAYSEC LABS - CLOUD BREACH (LEVEL 3)      "
echo "================================================="
echo "Log analizini bitirdiysen sorulara cevap ver."
echo "Dikkat: Cevaplari bosluk birakmadan ve tam yaz."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Saldirganin büründügü IAM Rolünün tam ARN'si (roleArn) nedir? : " q1
if [ "$q1" != "arn:aws:iam::123456789012:role/DatabaseAdminRole" ]; then
    echo "Yanlis! 'AssumeRole' olayinin icindeki 'requestParameters' kismina dikkat et."
    exit 1
fi

# Soru 2
read -p "2. Saldirgan verileri sızdirirken hangi araci (userAgent) kullanmistir? : " q2
if [ "$q2" != "rclone/v1.53.3" ]; then
    echo "Yanlis! Veri cekme islemindeki (GetObject) 'userAgent' kismina iyi bak."
    exit 1
fi

# Soru 3
read -p "3. Calinan hassas dosyanin tam adi (key) nedir? : " q3
if [ "$q3" != "customer_data_2026.csv" ]; then
    echo "Yanlis! 'GetObject' cagrisi sirasinda hangi 'key' indirilmis?"
    exit 1
fi

echo ""
echo "MUKEMMEL! SOC TAKIMININ GURURUSUN!"
echo "Veri sizintisini ve hak yukseltme vektorunu tam anlamiyla desifre ettin!"
echo "Iste Final Bayragin:"
echo "QUxUQVlTRUN7M1hGMUxUUjRUMTBOXzRORF9QUjFWXzNTQ30=" | base64 -d
echo ""
echo ""
echo "================================================="