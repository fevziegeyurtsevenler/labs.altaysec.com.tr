# Nazende Gişesi — çözüm (spoiler)

Bunu README'ye veya public PR açıklamasına koyma.

## Flag 1 — `TUGA{DOKUZUNCU_LOCA_BOS_KALSIN}`

1. HTML kaynağında yorum: `/api/kuponlar`
2. `GET /api/kuponlar` yetkisiz tüm kodları verir: `OGRENCI10`, `LOCA-7`, `SUFLOR`
3. `LOCA-7` uygulanınca gişe `/loca/7` der
4. `/loca/7` protokol kaydı, flag yok: “Yedinci loca boş kalsın.”
5. `/loca/5` kişi bilgisi + “Beşinci loca boş kalsın.”
6. Kalıp 9’da biter: `/loca/9` → flag 1

Haritada L5 / L7 loca kaydına da gider.

Yem (flag değil): HTML yorumunda ve `/loca/1` notunda `FLAG{stajyer_sildi}`. Format `TUGA{}` olmadığı için sayılmaz.

## Flag 2 — `TUGA{PROVADA_ALKIS_YASAK}`

1. “Biletlerim” `/bilet/1004`
2. IDOR: `/bilet/1008` prova kaydı → flag 2
