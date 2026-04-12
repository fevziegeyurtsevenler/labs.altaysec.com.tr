############################################################
#                ALTAYSEC | Sızma Testi Laboratuvarı       #
#                      LAB-01: Stored XSS                  #
############################################################

PROJE HAKKINDA:
Bu laboratuvar, bir "İtiraf Duvarı" uygulaması üzerinden 
Kalıcı (Stored) XSS zafiyetini uygulamalı olarak göstermek 
için tasarlanmıştır.

KURULUM VE ÇALIŞTIRMA:

1. Gereksinimleri Yükleyin:
   $ pip install -r requirements.txt

2. Veritabanını Hazırlayın:
   $ python3 veritabani.py
   (Bu komut 'duvar.db' dosyasını oluşturur ve ilk verileri basar.)

3. Uygulamayı Başlatın:
   $ python3 app.py

4. Tarayıcıdan Erişin:
   http://localhost:5001

CANLIYA ALMA (DEPLOYMENT) NOTLARI:
- Uygulama şu an '0.0.0.0' üzerinde 5001 portunda çalışmaktadır.
- Dockerize etmek isterseniz Python 3.12 tabanlı bir imaj yeterlidir.
- Üretim ortamında 'app.run(debug=False)' olarak güncellenmesi önerilir.

ZAFİYET BİLGİSİ:
- Seviye: Orta (Medium)
- Engel: Uygulama, temel '<script>' etiketlerini filtrelemektedir.
- Amaç: Filtreleme mekanizmasını atlatarak (Bypass) tarayıcıda kod çalıştırmak.

Not: Eğer 'externally-managed-environment' hatası alırsanız, 
önce bir sanal ortam oluşturup (python3 -m venv venv && source venv/bin/activate) 
ardından kurulumu yapınız.

Çağrı Ceyhan 
