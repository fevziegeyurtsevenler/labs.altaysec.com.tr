#!/bin/bash

echo "================================================="
echo "    ALTAYSEC LABS - CLOUD BREACH (LEVEL 1)       "
echo "================================================="
echo "Log analizini bitirdiysen sorulara cevap ver."
echo "Dikkat: Cevaplari bosluk birakmadan ve tam yaz."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Saldirgan kendi yetkilerini dogrulamak icin hangi olayi (eventName) tetiklemistir? : " q1
if [ "$q1" != "GetCallerIdentity" ]; then
    echo "Yanlis! Ilk tetiklenen API cagrisini tekrar incele."
    exit 1
fi

# Soru 2
read -p "2. Sisteme yetkisiz erisim saglayan IP adresi (sourceIPAddress) nedir? : " q2
if [ "$q2" != "198.51.100.42" ]; then
    echo "Yanlis! Loglardaki 'sourceIPAddress' alanlarini dikkatli kontrol et."
    exit 1
fi

# Soru 3
read -p "3. Saldirgan, sirketimizdeki hangi kullanicinin (userName) hesabina sizmistir? : " q3
if [ "$q3" != "dev_ahmet" ]; then
    echo "Yanlis! Ele gecirilen kimligin kime ait oldugunu bulmalisin."
    exit 1
fi

# Dogruysa Flag'i Base64'ten cozup ekrana bas
echo ""
echo "HARIKA! Tum baglantilari dogru kurdun."
echo "Iste Bayragin:"
echo "QUxUQVlTRUN7Q0wwVURfVFI0MUxfQjNHMU5OM1J9" | base64 -d
echo ""
echo ""
echo "================================================="