#!/bin/bash

echo "================================================="
echo "    ALTAYSEC LABS - MEMORY FORENSICS (LEVEL 1)   "
echo "================================================="
echo "Analizi bitirdiysen cevaplari gir."
echo "Dikkat: Buyuk/kucuk harfe duyarli degildir ama bosluklara dikkat et."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Isletim sistemi versiyonu (OS) nedir? (Orn: Windows XP) : " q1
# Cevabı küçük harfe çevirerek karşılaştır (Hata payını azaltır)
q1_lower=$(echo "$q1" | tr '[:upper:]' '[:lower:]')
if [ "$q1_lower" != "windows 7" ]; then
    echo "Yanlis! 'windows.info' pluginini kullanip OS degerine bak."
    exit 1
fi

# Soru 2
read -p "2. Supheli uygulamanin adi nedir? (uzantisiyla yazin) : " q2
q2_lower=$(echo "$q2" | tr '[:upper:]' '[:lower:]')
if [ "$q2_lower" != "nc.exe" ]; then
    echo "Yanlis! 'windows.pslist' ciktisindaki 'ImageFileName' sutununu incele."
    exit 1
fi

# Soru 3
read -p "3. Supheli uygulamanin PID degeri nedir? : " q3
if [ "$q3" != "1824" ]; then
    echo "Yanlis! Buldugun uygulamanin hemen yanindaki PID sutununa bak."
    exit 1
fi

echo ""
echo "HARIKA! Zararli yazilimi RAM uzerinde basariyla yakaladin!"
echo "Iste Bayragin:"
# ALTAYSEC{M3M0RY_TR14G3_C0MPL3T3}
echo "QUxUQVlTRUN7TTNNMFJZX1RSMTRHM19DME1QTDNUM30=" | base64 -d
echo ""
echo ""
echo "================================================="