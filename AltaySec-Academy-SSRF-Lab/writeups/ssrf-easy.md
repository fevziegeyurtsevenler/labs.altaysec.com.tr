# SSRF Lab 1 (Kolay) - Çözüm

## Amaç
Yalnızca dahili erişime açık uç noktaya ulaşıp flag’i okumak.

## Neden Çalışıyor
`/fetch.php` hiçbir doğrulama yapmadan verilen URL’i sunucu tarafından çağırıyor.

## Adımlar
1. Fetch uç noktasına loopback adresini hedefleyen bir URL gönderin.
2. Dönen içerikte flag’i okuyun.

## Örnek Payload
```bash
curl "http://localhost:8081/fetch.php?url=http://127.0.0.1/secret.php"
```

## Flag
AltaySec{ssrf_lab_kolay_tamamlandi}
