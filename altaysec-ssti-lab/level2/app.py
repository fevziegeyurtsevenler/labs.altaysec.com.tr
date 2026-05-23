from flask import Flask, render_template, request, render_template_string

app = Flask(__name__)

app.config['FLAG'] = "ALTAYSEC{w4f_byp4ss_m4st3r_unl0ck3d}"

BLACKLIST = ["config", "flag", "class", "mro", "subclasses", "builtins", "import"]

def waf_kontrol(payload):
    for word in BLACKLIST:
        if word in payload.lower():
            return True 
    return False

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
    if request.method == "POST":
        input_val = request.form.get("message", "")
        
        if waf_kontrol(input_val):
            output = "<span style='color:#ff4d4d; font-weight:bold;'>[WAF BLOCKED] MALICIOUS PAYLOAD DETECTED! ACCESS DENIED.</span>"
        else:
            try:
                output = render_template_string(input_val)
            except Exception as e:
                output = f"Error: {str(e)}"
                
    return render_template("preview.html", output=output, input_val=input_val)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)