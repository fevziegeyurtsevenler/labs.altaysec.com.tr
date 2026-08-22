# AltaySec Labs

[labs.altaysec.com.tr](https://labs.altaysec.com.tr/) sitesinin kaynak kodu.

Docker tabanlı, yerel kurulum gerektiren siber güvenlik zafiyet laboratuvarlarının kataloğu. AltaySec topluluğu tarafından hazırlanır ve tümü ücretsizdir. Lablar kendi bilgisayarınızda izole Docker kapsülleri halinde çalışır; gerçek veya üçüncü taraf sistemlere herhangi bir işlem yapılmaz.

## Kurulum (kullanıcılar için)

1. Bilgisayarınıza [Docker](https://docs.docker.com/get-docker/) kurun.
2. Sitede çözmek istediğiniz labın altındaki butonla Docker / `git clone` komutunu kopyalayın.
3. Komutu terminale yapıştırıp çalıştırın.
4. Komutta belirtilen porta göre (örneğin `localhost:8081`) tarayıcıdan lab ortamına erişin.

## Kategoriler

- XSS Labları — Cross-Site Scripting saldırıları ve filtre atlatma.
- IDOR Labları — Insecure Direct Object Reference ve yetki aşımı.
- DOM XSS Labları — DOM tabanlı XSS ve client-side atlatmalar.
- Log Analizi Labları — Saldırı tespiti ve Blue Team defans taktikleri.
- Network Forensics — Ağ trafiği analizi, pcap inceleme.
- LFI Labları — Yerel dosya dahil etme zafiyetleri.
- CSRF Labları — Cross-Site Request Forgery ve bankacılık simülasyonu.
- Cloud Güvenliği — AWS CloudTrail log analizi ve bulut güvenliği.
- SSTI Labları — Server-Side Template Injection.
- Memory Forensics — Bellek imajı analizi, Volatility 3.
- XXE Labları — XML External Entity zafiyetleri.
- SSRF Labları — Server-Side Request Forgery.
- LLM Güvenliği — Prompt Injection, Jailbreak, System Prompt Exfiltration.
- Broken Auth — Kimlik doğrulama ve şifre sıfırlama mantık hataları.

## Teknik

Tek sayfa statik site (`index.html`, `styles.css`, `script.js`). Cloudflare Pages üzerinde barındırılır. Lab dizinleri her labın Docker dosyalarını ve README'sini içerir.

## Ekosistem

Ana site: [altaysec.com.tr](https://altaysec.com.tr)

---

## English (summary)

Source code of [labs.altaysec.com.tr](https://labs.altaysec.com.tr/) — a catalog of Docker-based, locally-run cybersecurity vulnerability labs by the AltaySec community. All labs are free and run in isolated Docker containers on your own machine; no action is taken against real or third-party systems.

Topics include XSS, DOM XSS, IDOR, LFI, CSRF, SSRF, SSTI, XXE, LLM security (prompt injection / jailbreak), broken auth, plus Blue Team labs (log analysis, network/memory forensics, cloud security, SOC dashboard).

To run a lab: install Docker, copy the command shown under the lab on the site, run it in your terminal, then open the indicated port in your browser. Main site: [altaysec.com.tr](https://altaysec.com.tr)
