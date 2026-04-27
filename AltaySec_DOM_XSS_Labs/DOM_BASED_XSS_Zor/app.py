from flask import Flask, render_template_string

app = Flask(__name__)

HTML_CONTENT = """
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>AltaySec Akademi - Elite Lab</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
        .card { background: #1e293b; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); width: 100%; max-width: 500px; padding: 35px; border: 1px solid #334155; margin-bottom: 20px; text-align: center; }
        h1, h2 { color: #38bdf8; margin: 0 0 20px 0; }
        .input-row { display: flex; gap: 10px; margin-bottom: 15px; text-align: left; }
        .input-group { flex: 1; text-align: left; }
        label { display: block; margin-bottom: 5px; color: #94a3b8; font-size: 0.85rem; }
        input, select, button { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: white; outline: none; box-sizing: border-box; }
        button { background: #38bdf8; color: #0f172a; font-weight: bold; cursor: pointer; border: none; margin-top: 10px; transition: 0.3s; }
        #result-area { background: #000; color: #22c55e; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; margin-top: 20px; border: 1px solid #166534; text-align: left; min-height: 80px; }
        .target-label { color: #94a3b8; font-size: 0.9rem; margin-bottom: 8px; display: block; }
    </style>
</head>
<body>
    <div class="card">
        <h1>AltaySec Akademi</h1>
        
        <div class="input-row">
            <div class="input-group">
                <label>Miktar Girin:</label>
                <input type="number" id="amt" value="1000">
            </div>
            <div class="input-group">
                <label>Sahip Olunan Birim:</label>
                <select id="from_cur">
                    <option value="TRY">TRY</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                </select>
            </div>
        </div>

        <div class="input-group" style="margin-bottom: 15px;">
            <label>Dönüşümü İstenen Birim (Hedef):</label>
            <input type="text" id="to_cur" placeholder="Örn: BTC veya ETH">
        </div>

        <button onclick="calculate()">Hesapla ve Analiz Et</button>
        
        <div id="result-area">
            <div>İşlem bekleniyor...</div>
        </div>
    </div>

    <div class="card">
        <h2>🚩 Flag Doğrulama</h2>
        <input type="text" id="flagInput" placeholder="Flag'i girin...">
        <button onclick="verify()" style="background: #a855f7; color: white;">Doğrula</button>
        <p id="status" style="margin-top:10px; font-weight:bold;"></p>
    </div>

<script>
    window.revealSecretFlag = function() {
        const encoded = "QWx0YXlTZWN7RE9NX1hTU19NQVNURVJfREVDT0RFUn0=";
        document.getElementById('result-area').innerHTML = "<span style='color:#38bdf8'>[SİSTEM SIZINTISI] Base64 Verisi:</span><br>" + encoded;
    };

    function calculate() {
        const amt = document.getElementById('amt').value;
        const from = document.getElementById('from_cur').value;
        const to = document.getElementById('to_cur').value;
        if(to) {
            window.location.href = `?amount=${amt}&from=${from}&to=${encodeURIComponent(to)}`;
        }
    }

    function verify() {
        const input = document.getElementById('flagInput').value;
        const status = document.getElementById('status');
        if(input === "AltaySec{DOM_XSS_MASTER_DECODER}") {
            status.innerHTML = "✅ Başarılı! Sistem Ele Geçirildi."; status.style.color = "#22c55e";
        } else {
            status.innerHTML = "❌ Hatalı Bayrak!"; status.style.color = "#ef4444";
        }
    }

    window.onload = function() {
        const p = new URLSearchParams(window.location.search);
        let amount = parseFloat(p.get('amount'));
        let from = p.get('from');
        let to = p.get('to');
        const res = document.getElementById('result-area');

        if (amount && from && to) {
            let rates = { "BTC": 0.00000045, "ETH": 0.0000082, "USD": 0.031 };
            let rate = rates[to.toUpperCase()] || 0.05; 
            
            if (/script|onerror|onload/gi.test(to)) {
                res.innerHTML = "<span style='color:red'>HATA: Zararlı giriş tespit edildi!</span>";
            } else {
                // Zafiyet Noktası
                res.innerHTML = `<strong>Dönüşüm Sonucu:</strong><br>${amount} ${from} = ${(amount * rate).toFixed(8)} ${to}`;
            }
        }
    };
</script>
</body>
</html>
"""

@app.route('/')
def index(): return render_template_string(HTML_CONTENT)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
