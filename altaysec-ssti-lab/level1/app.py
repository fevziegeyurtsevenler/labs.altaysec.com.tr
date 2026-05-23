from flask import Flask, render_template, request, render_template_string

app = Flask(__name__)

# Bayrağı konfigürasyona ekliyoruz
app.config['FLAG'] = "ALTAYSEC{ssti_m3rch_st0r3_unl0ck3d}"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/product")
def product():
    return render_template("product.html")

@app.route("/preview", methods=["GET", "POST"])
def preview():
    output = None
    input_val = ""
    is_solved = False 

    if request.method == "POST":
        input_val = request.form.get("message", "")
        
        if input_val:
            try:
                # KRİTİK DÜZELTME: config nesnesini içeriye 'config' adıyla gönderiyoruz
                output = render_template_string(input_val, config=app.config)
                
                # Çözüm Kontrolü
                if output and ("<Config" in str(output) or app.config['FLAG'] in str(output)):
                    is_solved = True
                    
            except Exception as e:
                output = f"Error: {str(e)}"
    
    return render_template("preview.html", output=output, input_val=input_val, is_solved=is_solved)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)