(function () {
    "use strict";

    const form      = document.getElementById("threat-form");
    const typeInput = document.getElementById("threat-type");
    const valInput  = document.getElementById("threat-value");
    const submitBtn = document.getElementById("submit-btn");
    const logBox    = document.getElementById("log-output");

    if (!form || !typeInput || !valInput || !submitBtn || !logBox) {
        return;
    }

    function escapeXml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    function buildXmlPayload(type, value) {
        return (
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            "<threat>\n" +
            "    <type>"  + escapeXml(type)  + "</type>\n" +
            "    <value>" + escapeXml(value) + "</value>\n" +
            "</threat>"
        );
    }

    function renderLog(text, isError) {
        logBox.textContent = text;
        logBox.classList.toggle("is-error", Boolean(isError));
        logBox.scrollTop = 0;
    }

    function formatResponse(data) {
        const lines = [];
        lines.push("[+] BAĞLANTI: 200 OK");
        if (data.ticket_id) lines.push("[+] TICKET  : " + data.ticket_id);
        if (data.timestamp) lines.push("[+] ZAMAN   : " + data.timestamp);
        if (data.type)      lines.push("[+] TÜR     : " + data.type);
        lines.push("");
        lines.push("--- Sunucu Mesajı ---");
        lines.push(String(data.message || "(boş)"));
        return lines.join("\n");
    }

    async function submitReport(event) {
        event.preventDefault();

        const type  = typeInput.value.trim();
        const value = valInput.value.trim();

        if (!type || !value) {
            renderLog("[-] HATA: Tehdit türü ve değer boş bırakılamaz.", true);
            return;
        }

        const xmlBody = buildXmlPayload(type, value);

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "GÖNDERİLİYOR...";
        renderLog("[*] Bildirim XML olarak hazırlanıyor ve sunucuya iletiliyor...\n\n" + xmlBody, false);

        try {
            const response = await fetch("api.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/xml; charset=UTF-8",
                    "Accept": "application/json"
                },
                body: xmlBody
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                renderLog("[-] Sunucu geçersiz cevap döndü:\n\n" + text, true);
                return;
            }

            if (!response.ok || data.status === "error") {
                const detail = data.detail ? "\n\nDetay: " + JSON.stringify(data.detail, null, 2) : "";
                renderLog("[-] HATA (" + response.status + "): " + (data.message || "Bilinmeyen hata.") + detail, true);
                return;
            }

            renderLog(formatResponse(data), false);
        } catch (err) {
            renderLog("[-] AĞ HATASI: " + (err && err.message ? err.message : err), true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    form.addEventListener("submit", submitReport);
})();
