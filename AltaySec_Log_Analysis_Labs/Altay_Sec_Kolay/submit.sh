#!/bin/bash

echo "================================================="
echo "    ALTAYSEC BLUE TEAM - INCIDENT RESPONSE       "
echo "================================================="
echo "Log analizini bitirdiysen sorulara cevap ver."
echo "Dikkat: Cevaplari bosluk birakmadan ve tam yaz."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Saldirganin IP adresi nedir? : " q1
if [ "$q1" != "45.33.22.11" ]; then
    echo "Yanlis! access.log dosyasindaki saldiri paternlerini tekrar incele."
    exit 1
fi

# Soru 2
read -p "2. Saldirganin basarili (HTTP 302) giris yaparken kullandigi Brute-Force aracinin (User-Agent) tam adi nedir? (Ornek: dirb/2.22) : " q2
if [ "$q2" != "Hydra/9.2" ]; then
    echo "Yanlis! Aracin tam surumunu loglardan bulmalisin."
    exit 1
fi

# Dogruysa Flag'i Base64'ten cozup ekrana bas
echo ""
echo "HARIKA! Tum baglantilari dogru kurdun."
echo "Iste Bayragin:"
echo "QUxUQVl7TDFfUkVDT05fQU5EX0JSVVRFRjBSQ0VfREVURUNURUR9" | base64 -d
echo ""
echo "================================================="