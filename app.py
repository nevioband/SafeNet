import sqlite3
from flask import Flask, request

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def index():
    conn = get_db()
    entries = conn.execute("SELECT * FROM entries ORDER BY id DESC").fetchall()
    conn.close()

    html = "<h1>Eintragsliste</h1>"
    html += "<p>Neuen Eintrag hinzufügen: /add?name=Beispiel</p><hr>"

    for entry in entries:
        html += (
            f"<p>#{entry['id']} – {entry['name']} "
            f"<a href='/delete?id={entry['id']}'>[löschen]</a></p>"
        )

    return html

@app.route("/add")
def add():
    name = request.args.get("name")

    if not name:
        return "Bitte einen Wert angeben, z. B. /add?name=Beispiel"

    conn = get_db()
    conn.execute("INSERT INTO entries(name) VALUES (?)", (name,))
    conn.commit()
    conn.close()

    return "Eintrag hinzugefügt. Zurück zu: /"

@app.route("/delete")
def delete():
    entry_id = request.args.get("id")

    if not entry_id:
        return "Bitte eine id angeben, z. B. /delete?id=1"

    conn = get_db()
    conn.execute("DELETE FROM entries WHERE id = ?", (entry_id,))
    conn.commit()
    conn.close()

    return "Eintrag gelöscht. Zurück zu: /"

if __name__ == '__main__':
    app.run(debug=True)