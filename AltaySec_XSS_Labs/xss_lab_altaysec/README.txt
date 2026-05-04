############################################################
#                ALTAYSEC | Sızma Testi Laboratuvarı       #
#                      LAB-01: Stored XSS                  #
############################################################

PROJE HAKKINDA:
Bu laboratuvar, bir "İtiraf Duvarı" uygulaması üzerinden 
Kalıcı (Stored) XSS zafiyetini uygulamalı olarak göstermek 
için tasarlanmıştır.

ZAFİYET BİLGİSİ:
- Zafiyet Türü: Stored Cross-Site Scripting (XSS)
- Konum: Mesaj gönderim alanı (icerik input)
- Teknik Detay: Jinja2 template motorunda '| safe' filtresi 
  kullanılarak girdi temizleme (sanitization) devre dışı bırakılmıştır.

Çağrı Ceyhan 
