# Nazende Gişesi

Kadife koltukları ve dar fuayesiyle eski bir semt tiyatrosunun aceleye gelmiş bilet gişesi.

Belediye satışı siteye almış, iş stajyere kalmış. Afişte bu haftanın oyunları ve vitrinde bir öğrenci kuponu duruyor.

## Amaç

Sitede **iki flag** var. Format: `TUGA{...}`

Kupon tarafını ve loca / bilet kayıtlarını incele.

## Canlı önizleme

https://nazende-gisesi.vercel.app

Asıl teslim Docker’dır. Canlı link yalnızca sınıfta bakmak içindir.

## Kurulum

Docker ve Docker Compose yeter.

```bash
docker compose up --build
```

Tarayıcı: http://localhost:8080

Durdurmak:

```bash
docker compose down
```

## Not

Bu ortam kasıtlı olarak zafiyetlidir. Yalnızca kendi makinenizde, eğitim için çalıştırın. İnternete açık bir sunucuya koymayın.
