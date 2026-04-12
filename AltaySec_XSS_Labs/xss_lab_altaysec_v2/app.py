from flask import Flask, render_template, request, redirect
import sqlite3

app = Flask(__name__)

def db_baglan():
    return sqlite3.connect('duvar.db')

@app.route('/', methods=['GET'])
def index():
    baglanti = db_baglan()
    imlec = baglanti.cursor()
    imlec.execute("SELECT * FROM mesajlar ORDER BY id DESC")
    tum_mesajlar = imlec.fetchall()
    baglanti.close()
    return render_template('index.html', mesajlar=tum_mesajlar)

@app.route('/gonder', methods=['POST'])
def gonder():
    gonderen = request.form.get('gonderen')
    icerik = request.form.get('icerik')
   
    # Sadece küçük harf "<script>" ifadesini bir kez temizler.
    # Bypass yolları <SCRIPT>, <scr<script>ipt>, <img src=x onerror=...>
    if icerik:
        icerik = icerik.replace('<script>', '')
        icerik = icerik.replace('</script>', '')
    
    ip_adresi = request.remote_addr

    baglanti = db_baglan()
    imlec = baglanti.cursor()
    
    imlec.execute("INSERT INTO mesajlar (gonderen, icerik, ip_adresi) VALUES (?, ?, ?)", 
                  (gonderen, icerik, ip_adresi))
    
    baglanti.commit()
    baglanti.close()

    return redirect('/')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
