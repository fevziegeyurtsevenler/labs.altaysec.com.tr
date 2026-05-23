#!/bin/bash

echo "================================================="
echo "    ALTAYSEC LABS - MEMORY FORENSICS (LEVEL 2)   "
echo "================================================="
echo "Gizli surecleri desifre ettiysen cevaplari gir."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Zararlinin baglandigi C2 sunucusunun IP adresi nedir? : " q1
if [ "$q1" != "198.51.100.88" ]; then
    echo "Yanlis! 'windows.netstat' komutuyla ForeignAddr kismina dikkat et."
    exit 1
fi

# Soru 2
read -p "2. pslist'te gizlenen zararlinin adi nedir? (Orn: abc.exe) : " q2
q2_lower=$(echo "$q2" | tr '[:upper:]' '[:lower:]')
if [ "$q2_lower" != "updater.exe" ]; then
    echo "Yanlis! 'windows.psxview' komutunda 'pslist' sutunu 'False' olana bak."
    exit 1
fi

# Soru 3
read -p "3. Bu gizli zararlinin Parent PID (PPID) degeri nedir? : " q3
if [ "$q3" != "2048" ]; then
    echo "Yanlis! 'windows.pstree' komutuyla updater.exe'nin ebeveynini bul."
    exit 1
fi

echo ""
echo "MUKEMMEL! Gizli zararliyi ve C2 altyapisini tespit ettin!"
echo "Iste Bayragin:"
# ALTAYSEC{H1DD3N_PR0C3SS_C2_F0UND}
echo "QUxUQVlTRUN7SDFERDNOX1BSMEMzU1NfQzJfRjBVTkR9" | base64 -d
echo ""
echo ""
echo "================================================="