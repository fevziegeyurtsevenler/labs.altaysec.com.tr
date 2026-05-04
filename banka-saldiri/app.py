from flask import Flask, request, render_template, redirect, url_for, session, make_response
import os

app = Flask(__name__)
app.secret_key = "b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8"

app.config["SESSION_COOKIE_HTTPONLY"] = True

CSRF_TOKEN = "a1b2c3d4e5f6789012345678abcdef00"

USERS = {
    "user": "user123"
}

ACCOUNTS = {
    "user": {"balance": 24750.00}
}


@app.route("/", methods=["GET"])
def index():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        nickname = request.form.get("nickname", "")
        password = request.form.get("password", "")
        if nickname in USERS and USERS[nickname] == password:
            session["user"] = nickname
            response = make_response(redirect(url_for("transfer")))
            # Zafiyet gösterimi için ayrı cookie — SameSite=None
            response.set_cookie(
                "session_id",
                value=os.urandom(16).hex(),
                samesite="None",
                secure=False,
                httponly=True
            )
            return response
        error = "Invalid credentials."
    return render_template("login.html", error=error)


@app.route("/transfer", methods=["GET", "POST"])
def transfer():
    if "user" not in session:
        return redirect(url_for("login"))

    user = session["user"]
    account = ACCOUNTS[user]
    message = None

    if request.method == "POST":
        token = request.form.get("csrf_token", "")
        recipient = request.form.get("recipient", "")
        try:
            amount = float(request.form.get("amount", 0))
        except ValueError:
            amount = 0

        if token == CSRF_TOKEN and amount > 0 and recipient:
            if amount <= account["balance"]:
                account["balance"] -= amount
                message = f"Transfer of ${amount:,.2f} to {recipient} completed."
            else:
                message = "Insufficient funds."
        else:
            message = "Request could not be processed."

    return render_template(
        "transfer.html",
        name=user,
        balance=account["balance"],
        csrf_token=CSRF_TOKEN,
        message=message
    )


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
