#!/bin/bash

echo "================================================="
echo "    ALTAYSEC BLUE TEAM - LEVEL 2 (MEDIUM)        "
echo "================================================="
echo "Log analizini bitirdiysen sorulara cevap ver."
echo "Dikkat: Cevaplari logdaki gibi tam ve bosluklara dikkat ederek yaz."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Saldirganin Shellshock zafiyetini tetiklemek icin kullandigi imza (desen) nedir? : " q1
if [ "$q1" != "() { :; };" ]; then
    echo " Yanlis! Imza genellikle User-Agent icinde gizlidir ve parantez/suslu parantez icerir."
    exit 1
fi

# Soru 2
read -p "2. Saldirganin zafiyeti somurmek icin istek (GET) attigi dosya yolu nedir? : " q2
if [ "$q2" != "/cgi-bin/status" ]; then
    echo " Yanlis! Genellikle cgi-bin dizinindeki dosyalar hedef alinir."
    exit 1
fi

# Soru 3
read -p "3. Saldirganin Linux sistemindeki parolalari iceren dosyayi okumak icin yazdigi komut nedir? : " q3
if [ "$q3" != "/bin/cat /etc/shadow" ]; then
    echo " Yanlis! cat komutuna ve okunan hassas dosyaya (shadow) dikkat et."
    exit 1
fi

# Dogruysa Flag'i goster
echo ""
echo "KUSURSUZ ANALIZ! Korelasyon harika."
echo "Iste Bayragin:"
echo "QUxUQVl7TDJfQ1ZFXzIwMTRfNjI3MV9TSDNMTFNIT0NLfQ==" | base64 -d
echo ""
echo "================================================="