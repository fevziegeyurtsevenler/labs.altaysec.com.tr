#!/bin/bash

echo "================================================="
echo "    ALTAYSEC BLUE TEAM - LEVEL 3 (HARD)          "
echo "================================================="
echo "Iki log dosyasini da (access.log ve system_audit.log)"
echo "incelediysen sorulara geciyoruz. Dikkatli cevapla!"
echo "-------------------------------------------------"

# Soru 1
read -p "1. Saldirganin web sunucusunda dizin taramasi yaparken kullandigi aracin adi nedir? (Sadece aracin adini yaz, ornek: dirb) : " q1
if [ "$q1" != "ffuf" ]; then
    echo " Yanlis! access.log dosyasinda cok sayida 404/403 hatasi ureten User-Agent'i bulmalisin."
    exit 1
fi

# Soru 2
read -p "2. Saldirganin sisteme yukledigi ve web shell olarak kullandigi dosyanin tam adi nedir? : " q2
if [ "$q2" != "avatar_99.php.png" ]; then
    echo " Yanlis! access.log icinde POST istegiyle veya Base64 parametreleriyle cagirilan dosyaya bak."
    exit 1
fi

# Soru 3
read -p "3. (system_audit.log'a gec) Saldirgan okudugu gizli veriyi disari sizdirmak icin hangi araci/komutu kullanmistir? : " q3
if [ "$q3" != "curl" ]; then
    echo " Yanlis! system_audit.log icinde www-data kullanicisinin disari baglanti actigi komutu bul."
    exit 1
fi

# Soru 4
read -p "4. Saldirganin disari sizdirdigi (data=...) Base64 formatiyla sifrelenmis metin tam olarak nedir? : " q4
if [ "$q4" != "QUxUQVl7V0VCX1RPX09TX1NURUFMVEhfREVURUNURUR9" ]; then
    echo " Yanlis! curl komutunun icindeki data parametresini eksiksiz kopyalamalisin."
    exit 1
fi

# Dogruysa Flag'i goster
echo ""
echo "MUKEMMEL! APT SEVIYESI TESPIT YAPTIN!"
echo "Iste Bayragin:"
echo "QUxUQVl7V0VCX1RPX09TX1NURUFMVEhfREVURUNURUR9" | base64 -d
echo ""
echo "================================================="