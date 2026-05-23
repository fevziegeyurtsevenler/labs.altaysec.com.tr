# SSRF Lab 2 (Orta) - Çözüm

## Amaç
Naif engel listesini bypass ederek dahili uç noktaya ulaşmak.

## Neden Çalışıyor
Engel listesi yalnızca host içinde `127.0.0.1` ve `localhost` metinlerini arıyor. Alternatif IP gösterimleri bu kontrolü aşar.

## Adımlar
1. Host bölümünde loopback adresinin farklı bir gösterimini kullanın.
2. Fetch uç noktasına isteği gönderip yanıtı okuyun.

## Örnek Payload
```bash
curl "http://localhost:8082/fetch.php?url=http://127.1/secret.php"
```

## Flag
AltaySec{ssrf_lab_orta_tamamlandi}
