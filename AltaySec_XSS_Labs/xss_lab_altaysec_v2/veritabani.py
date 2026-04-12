import sqlite3

def db_olustur():
    baglanti = sqlite3.connect('duvar.db')
    imlec = baglanti.cursor()

    imlec.execute('DROP TABLE IF EXISTS mesajlar')
    imlec.execute('''
        CREATE TABLE mesajlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            gonderen TEXT,
            icerik TEXT,
            ip_adresi TEXT
        )
    ''')
    
    imlec.execute("INSERT INTO mesajlar (gonderen, icerik, ip_adresi) VALUES (?, ?, ?)", 
              ("Sistem_Botu", "Hoş geldiniz, lütfen etik kurallara uyunuz.", "127.0.0.1"))

    baglanti.commit()
    baglanti.close()
    print("Veritabanı güncellendi.")

if __name__ == '__main__':
    db_olustur()
