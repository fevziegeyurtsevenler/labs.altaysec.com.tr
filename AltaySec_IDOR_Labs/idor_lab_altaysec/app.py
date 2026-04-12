from flask import Flask, request, render_template_string, redirect, url_for
import random

app = Flask(__name__)

tickets_db = {
    1:  {"name": "Admin (root)",       "type": "VIP - ORGANİZATÖR",      "seat": "A-01", "price": "PAHA BİÇİLEMEZ", "secret": "ALTAYSEC{eglenceyi_kacirma}"},
    2:  {"name": "Ahmet Demir",        "type": "Ekip Lideri", "seat": "A-03", "price": "ÜCRETSİZ (GÖREVLİ)", "secret": "Sunucuların yedeğini almayı unuttum..."},
    3:  {"name": "Ceren Arslan", "type": "Lider Yardımcısı",       "seat": "A-07", "price": "ÜCRETSİZ (BAŞKAN)", "secret": "Gelecek dönemin etkinlik planı çantamda."},
    4:  {"name": "Mehmet Yılmaz",   "type": "Lider Yardımcısı",  "seat": "B-01", "price": "ÜCRETSİZ", "secret": "xxx"},
    5:  {"name": "İrem Çetin",         "type": "Teknik Ekip",      "seat": "B-05", "price": "100 TL", "secret": "xxx"},
    6:  {"name": "Emre Çelik",    "type": "Adana'","seat": "B-09", "price": "100 TL", "secret": "xxx"},
    7:  {"name": "Buse Kaya",         "type": "Misafir",                "seat": "C-01", "price": "100 TL", "secret": "xxx"},
    8:  {"name": "Kerem Kılıç",    "type": "Misafir",                "seat": "C-02", "price": "100 TL", "secret": "xxx"},
    9:  {"name": "Nazlı Koç",   "type": "Misafir",                "seat": "VIP-1","price": "100 TL", "secret": "xxx"},
    10: {"name": "Tolga Özkan",     "type": "Misafir",                "seat": "D-10", "price": "100 TL", "secret": "xxx"},
    11: {"name": "Zeynep Aydın",    "type": "Misafir",                "seat": "D-11", "price": "100 TL", "secret": "xxx"},
    12: {"name": "Can Kaya",             "type": "Misafir",                "seat": "E-01", "price": "100 TL", "secret": "xxx"}
}

current_id_counter = 21

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>ALTAYSEC Bilet Satış</title>
    <style>
        body {
            background-color: #0f0f1a;
            color: #e0e0e0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        }
        .container { text-align: center; }
        h1 { color: #00e5ff; text-shadow: 0 0 15px #00e5ff; margin-bottom: 20px; }
        
        /* Form Tasarımı */
        form {
            background: #16213e;
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #00e5ff;
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.1);
            width: 300px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin: 0 auto;
        }

        label { text-align: left; color: #00e5ff; font-size: 0.9em; margin-bottom: -10px; }

        input, select {
            padding: 12px;
            border-radius: 5px;
            border: 1px solid #444;
            background: #0f0f1a;
            color: white;
            font-size: 1rem;
            outline: none;
        }
        
        input[readonly] {
            background-color: #2a2a2a;
            color: #ff0055;
            font-weight: bold;
            cursor: not-allowed;
        }

        button {
            padding: 15px;
            background: #00e5ff;
            color: #000;
            border: none;
            font-weight: bold;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1.1rem;
            margin-top: 10px;
        }
        button:hover { background: #00b8cc; }

        /* Bilet Tasarımı */
        .ticket {
            background: linear-gradient(135deg, #16213e, #1a1a2e);
            border: 2px solid #00e5ff;
            width: 600px;
            height: 250px;
            border-radius: 20px;
            display: flex;
            box-shadow: 0 0 30px rgba(0, 229, 255, 0.2);
            position: relative;
            overflow: hidden;
            margin-top: 20px;
        }

        .price-tag {
            position: absolute;
            top: 20px; right: -30px;
            background: #ff0055; color: white;
            padding: 10px 40px; transform: rotate(45deg);
            font-weight: bold; font-size: 1.2em;
            box-shadow: 0 5px 10px rgba(0,0,0,0.5);
        }

        .ticket-left { width: 70%; padding: 25px; display: flex; flex-direction: column; justify-content: center; text-align: left; }
        .ticket-right { width: 30%; display: flex; align-items: center; justify-content: center; background: #00e5ff; color: #000; font-size: 3em; font-weight: bold;}
        .label { font-size: 0.75em; color: #6bf; margin-bottom: 3px; }
        .value { font-size: 1.4em; font-weight: bold; color: #fff; margin-bottom: 15px; }
        .secret-box {
            background: rgba(255, 0, 85, 0.1);
            color: #ff0055;
            padding: 5px;
            font-size: 0.8em;
            margin-top: 5px;
            border: 1px solid #ff0055;
            border-radius: 4px;
        }

    </style>
    <script>
        function updatePrice() {
            var select = document.getElementById("ticketType");
            var priceInput = document.getElementById("priceInput");
            var selectedOption = select.options[select.selectedIndex];
            priceInput.value = selectedOption.getAttribute("data-price");
        }
    </script>
</head>
<body>

    <div class="container">
        {% if page == 'home' %}
            <h1>🎫 ALTAYSEC CYBER NİGHT</h1>
            
            <form method="POST" action="/buy">
                <label>Ad Soyad:</label>
                <input type="text" name="name" placeholder="Ad Soyad" required autocomplete="off">
                
                <label>Bilet Türü:</label>
                <select id="ticketType" name="type" onchange="updatePrice()">
                    <option value="Öğrenci" data-price="100">Öğrenci (100 TL)</option>
                    <option value="Tam" data-price="500">Tam (500 TL)</option>
                    <option value="VIP - Kulis" data-price="5000">VIP - Kulis (5000 TL)</option>
                </select>

                <label>Ödenecek Tutar (TL):</label>
                <input type="text" id="priceInput" name="price" value="100" readonly>
                
                <button type="submit">SATIN AL</button>
            </form>
        
        {% elif page == 'ticket' %}
            <h1>✅ BİLET GÖRÜNTÜLENİYOR</h1>
            
            <div class="ticket">
                <div class="price-tag">{{ ticket.price }}</div>
                <div class="ticket-left">
                    <div class="label">KATILIMCI</div>
                    <div class="value">{{ ticket.name }}</div>
                    <div class="label">BİLET TÜRÜ</div>
                    <div class="value">{{ ticket.type }}</div>
                    <div class="label">KOLTUK</div>
                    <div style="font-size:1.1em; color:#bbb;">{{ ticket.seat }}</div>
                    
                    {% if ticket.secret %}
                    <div class="secret-box">🔒 GİZLİ NOT: {{ ticket.secret }}</div>
                    {% endif %}
                </div>
                <div class="ticket-right">#{{ ticket_id }}</div>
            </div>
            
            {% if hacked %}
                <h2 style="color: #0f0; margin-top: 20px;">🎉 TEBRİKLER HACKER! 🎉</h2>
                <p>VIP Bileti ucuza kapattın. Sistem manipüle edildi.</p>
            {% endif %}

            <p style="margin-top:30px; color:#555;">Başkasının biletine bakmak için URL'deki ID'yi değiştir.</p>
            <a href="/" style="color:#00e5ff; display:block;">Yeni Bilet Al</a>

        {% elif page == 'error' %}
            <h1 style="color: #ff4444;">❌ BİLET BULUNAMADI</h1>
            <p>Bu ID numarasına sahip bir bilet yok.</p>
            <a href="/" style="color:#00e5ff;">Geri Dön</a>
        {% endif %}
    </div>

</body>
</html>
"""

@app.route("/", methods=["GET"])
def index():
    return render_template_string(HTML_TEMPLATE, page='home')

@app.route("/buy", methods=["POST"])
def buy_ticket():
    global current_id_counter
    name = request.form.get("name")
    ticket_type = request.form.get("type")
    
    price = request.form.get("price")
    
    new_id = current_id_counter
    tickets_db[new_id] = {
        "name": name,
        "type": ticket_type,
        "seat": f"VIP-{random.randint(1,10)}" if "VIP" in ticket_type else f"F-{random.randint(10,99)}",
        "price": price, 
        "secret": None 
    }
    
    current_id_counter += 1
    
    return redirect(url_for('view_ticket', id=new_id))

@app.route("/bilet", methods=["GET"])
def view_ticket():
    ticket_id = request.args.get("id")
    
    if ticket_id and int(ticket_id) in tickets_db:
        ticket = tickets_db[int(ticket_id)]
        
        is_hacked = False
        try:
            clean_price = str(ticket['price']).replace(' TL', '').strip()
            if "VIP" in ticket['type'] and int(clean_price) < 5000:
                is_hacked = True
        except:
            pass 

        return render_template_string(HTML_TEMPLATE, page='ticket', ticket=ticket, ticket_id=ticket_id, hacked=is_hacked)
    else:
        return render_template_string(HTML_TEMPLATE, page='error')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
