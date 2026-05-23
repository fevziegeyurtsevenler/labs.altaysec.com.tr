<!-- SSRF Medium — Home Page Content -->
<div class="modal-overlay" id="modal-overlay">
    <div class="modal">
        <h2>🎉 Tebrikler!</h2>
        <p>SSRF zafiyetini başarıyla sömürdün ve bayrağı ele geçirdin.</p>
        <div class="flag-box" id="flag-display"></div>
        <button class="close-modal" onclick="document.getElementById('modal-overlay').style.display='none'">Devam Et</button>
    </div>
</div>

<div class="card fetch-card">
    <h3 style="font-family:'Fraunces',serif;margin-bottom:10px;">İçerik Toplayıcı</h3>
    <p style="font-size:14px;color:var(--text-muted);margin-bottom:15px;">Bu uygulama dahili engel listesi kullanarak geri döngü adreslerini yasaklar.</p>
    
    <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--text-muted);background:var(--bg);padding:10px;border-radius:6px;margin-bottom:15px;">
        GET /fetch.php?url=&lt;URL&gt; — Engellenen: 127.0.0.1, localhost
    </div>

    <div class="form-row">
        <input id="url-input" class="form-input" type="text" placeholder="URL giriniz" autocomplete="off">
        <button class="btn" id="fetch-btn">Veriyi Çek</button>
    </div>

    <div style="margin-top:20px;">
        <p style="font-size:13px;font-weight:600;color:var(--text-muted);margin-bottom:8px;">Sunucu Yanıtı:</p>
        <pre class="response-body" id="response-body">URL giriniz...</pre>
    </div>
</div>

<div class="card">
    <h3>Laboratuvar Senaryosu</h3>
    <p>Hedefiniz <strong>http://127.0.0.1/secret.php</strong> adresindeki bayrağa ulaşmaktır. Ancak sistem <code>127.0.0.1</code> ve <code>localhost</code> girişlerini engellemektedir. Bu engeli aşmak için IP adresinin alternatif gösterimlerini kullanmanız gerekmektedir.</p>
</div>

<script>
(function(){
    const btn=document.getElementById('fetch-btn'),input=document.getElementById('url-input'),body=document.getElementById('response-body');
    async function doFetch(){
        const url=input.value.trim();if(!url){input.focus();return;}
        body.textContent='Filtreler aşılıyor...';btn.disabled=true;
        try{
            const res=await fetch('/fetch.php?url='+encodeURIComponent(url));
            const text=await res.text();
            body.textContent=text||'(Boş yanıt)';
            
            if(text.includes('AltaySec{')){
                const flag = text.match(/AltaySec\{.*?\}/)[0];
                document.getElementById('flag-display').textContent = flag;
                document.getElementById('modal-overlay').style.display = 'flex';
            }
        }catch(e){body.textContent='Hata: '+e.message;}
        finally{btn.disabled=false;}
    }
    btn.addEventListener('click',doFetch);
    input.addEventListener('keydown',e=>e.key==='Enter'&&doFetch());
})();
</script>
