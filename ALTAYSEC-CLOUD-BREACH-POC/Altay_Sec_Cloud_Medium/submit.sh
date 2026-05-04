#!/bin/bash

echo "================================================="
echo "    ALTAYSEC LABS - CLOUD BREACH (LEVEL 2)       "
echo "================================================="
echo "Log analizini bitirdiysen sorulara cevap ver."
echo "Dikkat: Cevaplari bosluk birakmadan ve tam yaz."
echo "-------------------------------------------------"

# Soru 1
read -p "1. Saldirganin arka kapi olarak olusturdugu gizli kullanicinin adi (userName) nedir? : " q1
if [ "$q1" != "aws_svc_backup_admin" ]; then
    echo "Yanlis! 'CreateUser' logundaki 'requestParameters' icine dikkatli bak."
    exit 1
fi

# Soru 2
read -p "2. Bu yeni kullaniciya erisim anahtari uretmek icin kullanilan olay (eventName) nedir? : " q2
if [ "$q2" != "CreateAccessKey" ]; then
    echo "Yanlis! Kullanici olusturulduktan hemen sonraki API cagrisini incele."
    exit 1
fi

# Soru 3
read -p "3. Saldirganin madencilik icin baslattigi sunucunun tipi (instanceType) nedir? : " q3
if [ "$q3" != "g4dn.xlarge" ]; then
    echo "Yanlis! 'RunInstances' olayinin parametrelerine (requestParameters) bakmalisin."
    exit 1
fi

echo ""
echo "HARIKA! Saldirganin arka kapisini ve kripto madencilik operasyonunu cokerttin!"
echo "Iste Bayragin:"
echo "QUxUQVlTRUN7UDNSUzFTVDNOQzNfNE5EX00xTjFOR30=" | base64 -d
echo ""
echo ""
echo "================================================="