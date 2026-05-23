#!/bin/bash

echo "================================================="
echo "    ALTAYSEC LABS - MEMORY FORENSICS (LEVEL 3)   "
echo "================================================="
echo "Sistemin en karanlik noktalarina ulastin. Cevaplari gir."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Enjeksiyon yapilmis mesru surecin adi nedir? (Orn: abc.exe) : " q1
q1_lower=$(echo "$q1" | tr '[:upper:]' '[:lower:]')
if [ "$q1_lower" != "svchost.exe" ]; then
    echo "Yanlis! 'windows.malfind' ciktisindaki Process sutununu incele."
    exit 1
fi

# Soru 2
read -p "2. Enjekte edilen bolgenin koruma yetkisi (Protection) nedir? : " q2
q2_upper=$(echo "$q2" | tr '[:lower:]' '[:upper:]')
if [ "$q2_upper" != "PAGE_EXECUTE_READWRITE" ]; then
    echo "Yanlis! Zararli kodun calisabilmesi icin ozel bir bellek yetkisi gerekir. 'malfind' ciktisina bak."
    exit 1
fi

# Soru 3
read -p "3. Administrator kullanicisinin NTLM Hash degeri nedir? : " q3
if [ "$q3" != "31d6cfe0d16ae931b73c59d7e0c089c0" ]; then
    echo "Yanlis! 'windows.hashdump' komutuyla Administrator satirindaki NTLM Hash kismina bak."
    exit 1
fi

echo ""
echo "USTALIK ESERI! Process Injection ve Hash Dump saldirisini basariyla cozdun!"
echo "Iste Bayragin:"
# ALTAYSEC{M3M0RY_1NJ3CT10N_H4SH_DUMP}
echo "QUxUQVlTRUN7TTNNMFJZXzFOSjNDVDFPTl9INFNIX0RVTVB9" | base64 -d
echo ""
echo ""
echo "================================================="