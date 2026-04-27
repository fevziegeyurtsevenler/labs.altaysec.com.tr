from flask import Flask, render_template_string, request
import base64

app = Flask(__name__)

HTML_CODE = """
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>AltaySec Akademi | Mission: Ghost Protocol</title>
    <style>
        body { background: #0a0a0a; color: #00ff41; font-family: 'Courier New', monospace; text-align: center; padding: 50px; }
        .challenge-box { border: 2px solid #00ff41; padding: 30px; background: #111; display: inline-block; border-radius: 10px; box-shadow: 0 0 20px #00ff4155; }
        input[type="text"] { background: #000; border: 1px solid #00ff41; color: #00ff41; padding: 10px; width: 250px; margin-bottom: 10px; }
        button { background: #00ff41; color: #000; border: none; padding: 10px 20px; cursor: pointer; font-weight: bold; margin: 5px; }
        #archive-node-01 { display: none; border: 2px dashed red; margin-top: 20px; padding: 20px; background: #1a0000; }
        #hint-text { display: none; color: #888; margin-top: 10px; }
    </style>
</head>
<body>

<div class="challenge-box">
    <h1>[ GÖREV: SİSTEM ERİŞİMİ ]</h1>
    <p>Yetkili erişimi için sistem verilerini manipüle edin.</p>
    
    <div id="data-view" style="background: #000; padding: 10px; border: 1px dashed #444; margin-bottom: 10px;">Sistem verisi bekleniyor...</div>
    
    <button style="background:#444; color:#fff; font-size:0.8em;" onclick="document.getElementById('hint-text').style.display='block'">İPUCU</button>
    <p id="hint-text">İpucu: 'query' parametresi ile 'x01_sec_init()' rutinini tetiklemeyi dene!</p>

    <div id="archive-node-01">
        <h2 style="color: red;">KRİTİK VERİ ERİŞİMİ</h2>
        <p id="flag-display"></p>
    </div>

    <div style="margin-top:20px; border-top: 1px solid #333; padding-top:20px;">
        <input type="text" id="ans-in" placeholder="Flag değerini girin"><br>
        <button onclick="val_process()">DOĞRULA</button>
        <div id="msg-out"></div>
    </div>
    <div style="margin-top: 20px; font-size: 0.7em; color: #444;">AltaySec Akademi</div>
</div>

<script>
    (function() {
        const p = new URLSearchParams(window.location.search);
        const q = p.get('query');

        if (q) {
            document.getElementById('data-view').innerHTML = "Status: " + q;
        }

        window.x01_sec_init = function() {
            const _0x4f2 = "QUxUQVlTRUN7RE9NX1hTU19VTkxPQ0tFRH0=";
            document.getElementById('archive-node-01').style.display = 'block';
            document.getElementById('flag-display').innerHTML = "Flag: <span style='color: white; background: blue; padding: 5px;'>" + atob(_0x4f2) + "</span>";
            document.getElementById('data-view').innerHTML = "<b style='color:red'>ACCESS GRANTED.</b>";
        };

        window.val_process = function() {
            const i = document.getElementById('ans-in').value;
            const o = document.getElementById('msg-out');
            if (i === atob("QUxUQVlTRUN7RE9NX1hTU19VTkxPQ0tFRH0=")) {
                o.style.color = "#00ff41"; o.innerText = "Sistem doğrulandı!";
            } else {
                o.style.color = "#ff3e3e"; o.innerText = "Hatalı giriş.";
            }
        };
    })();
</script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_CODE)

if __name__ == "__main__":
    app.run(debug=True, port=5001)
