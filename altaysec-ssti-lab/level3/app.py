import os
from flask import Flask, render_template, request, render_template_string

app = Flask(__name__)
os.environ['FINAL_FLAG'] = "ALTAYSEC{h34d3r_env_1nj3ct10n_compl3t3}"

# 1. Ana Sayfa Rotası
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/catalog")
@app.route("/product")
def catalog():
    return render_template("product.html")

@app.route("/preview", methods=["GET", "POST"])
def preview():
    output = "GUEST_OPERATOR"
    user_agent_display = ""
    
    input_val = request.form.get("message", "")
    
    if any(x in input_val for x in ["{", "}", "class", "mro", "config"]):
        output = "[WAF] BLOCK: IDENTITY STRING COMPROMISED"
    else:
        output = input_val if input_val else "GUEST_OPERATOR"

    ua = request.headers.get('User-Agent', '')
    
    filtered_ua = ua.replace("config", "ERR").replace("class", "ERR")
    
    try:
        user_agent_display = render_template_string(filtered_ua)
    except:
        user_agent_display = "Telemetry Error"

    return render_template("preview.html", output=output, ua_display=user_agent_display)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)