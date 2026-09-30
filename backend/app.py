from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
from datetime import datetime, timezone
import json, uuid, base64
import smtplib
from email.message import EmailMessage

BASE = Path(__file__).resolve().parent
DATA = BASE / "data.json"
UPLOADS = BASE / "uploads"
UPLOADS.mkdir(exist_ok=True)

if not DATA.exists():
    DATA.write_text(json.dumps({"complaints": []}, ensure_ascii=False, indent=2), encoding="utf-8")

app = Flask(__name__)
CORS(app)

ADMIN_USER = "admin"
ADMIN_PASS = "admin123"
TOKEN = "jalpa-demo-admin-token"

#Email configuration#
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# Replace this  with the Gmail address that owns the App Password
SENDER_EMAIL = "exaplehai@gmail.com"  

# Esma App Password
SENDER_PASSWORD = "qqqq qqqq qqqq qqqq"  # <-- here keep you app password generated from your Gmail account

# Admins email who will receive the notification 
ADMIN_EMAILS = [
    "hemrajpanditjee@gmail.com",    #admin 1
    "karkipadam948@gmail.com@gmail.com"  #admin2
]

def load_data():
    return json.loads(DATA.read_text(encoding="utf-8"))

def save_data(data):
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

def authorized():
    return request.headers.get("Authorization") == f"Bearer {TOKEN}"

#  Email notification function #
def send_admin_notification(complaint):
    msg = EmailMessage()
    msg['Subject'] = f"नयाँ गुनासो दर्ता भयो: {complaint['id']}"
    msg['From'] = SENDER_EMAIL
    msg['To'] = ", ".join(ADMIN_EMAILS)
    
    body = f"""
    नयाँ गुनासो प्राप्त भएको छ।
    
    दर्ता नम्बर: {complaint['id']}
    भूमिका: {complaint['role']}
    विषय: {complaint['category']}
    शीर्षक: {complaint['title']}
    विवरण: {complaint['description']}
    
    कृपया व्यवस्थापन गर्न प्रशासन ड्यासबोर्डमा लगइन गर्नुहोस्।
    """
    msg.set_content(body)
    
    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        print(f"Email sent successfully to admins for complaint {complaint['id']}")
    except Exception as e:
        print(f"Failed to send email: {e}")
# ==========================================

@app.get("/api/health")
def health():
    return {"ok": True, "message": "सर्भर चलिरहेको छ।"}

@app.post("/api/login")
def login():
    body = request.get_json(silent=True) or {}
    if body.get("username") == ADMIN_USER and body.get("password") == ADMIN_PASS:
        return {"ok": True, "token": TOKEN}
    return {"ok": False, "message": "प्रयोगकर्ता नाम वा पासवर्ड मिलेन।"}, 401

@app.post("/api/complaints")
def create_complaint():
    body = request.get_json(silent=True) or {}
    required = ["role", "category", "title", "description"]
    missing = [x for x in required if not body.get(x)]
    if missing:
        return {"message": "कृपया आवश्यक विवरण पूरा गर्नुहोस्।"}, 400

    cid = "गु-" + datetime.now().strftime("%Y%m%d") + "-" + uuid.uuid4().hex[:6].upper()
    now = datetime.now(timezone.utc).isoformat()

    c = {
        "id": cid,
        "created_at": now,
        "role": body.get("role"),
        "category": body.get("category"),
        "title": body.get("title"),
        "description": body.get("description"),
        "name": "" if body.get("anonymous") else body.get("name", ""),
        "contact": "" if body.get("anonymous") else body.get("contact", ""),
        "email": "" if body.get("anonymous") else body.get("email", ""),
        "location": body.get("location", ""),
        "anonymous": bool(body.get("anonymous")),
        "image_name": "",
        "voice_name": "",
        "status": "दर्ता भयो",
        "admin_note": ""
    }

    # Image/PDF attachment
    attachment = body.get("attachment")
    if attachment and "," in attachment:
        try:
            ext = body.get("attachment_ext", ".jpg").lower()
            if ext not in [".jpg", ".jpeg", ".png", ".pdf"]:
                ext = ".jpg"
            raw = base64.b64decode(attachment.split(",", 1)[1])
            if len(raw) <= 10 * 1024 * 1024:
                path = UPLOADS / f"{cid}-file{ext}"
                path.write_bytes(raw)
                c["image_name"] = path.name
        except Exception:
            pass

    voice = body.get("voice")
    if voice and "," in voice:
        try:
            raw = base64.b64decode(voice.split(",", 1)[1])
            if len(raw) <= 15 * 1024 * 1024:
                path = UPLOADS / f"{cid}-voice.webm"
                path.write_bytes(raw)
                c["voice_name"] = path.name
        except Exception:
            pass

    data = load_data()
    data["complaints"].insert(0, c)
    save_data(data)
    
    # --- SEND EMAIL TO ADMINS ---
    send_admin_notification(c)
    # ----------------------------
    
    return {"ok": True, "complaint": c}, 201

@app.get("/api/complaints")
def get_complaints():
    if not authorized():
        return {"message": "अनधिकृत पहुँच।"}, 401
    return {"complaints": load_data()["complaints"]}

@app.get("/api/complaints/<cid>")
def get_one(cid):
    for c in load_data()["complaints"]:
        if c["id"] == cid:
            public = dict(c)
            public.pop("name", None)
            public.pop("contact", None)
            public.pop("email", None)
            return {"complaint": public}
    return {"message": "गुनासो भेटिएन।"}, 404

@app.patch("/api/complaints/<cid>")
def update(cid):
    if not authorized():
        return {"message": "अनधिकृत पहुँच।"}, 401
    body = request.get_json(silent=True) or {}
    data = load_data()
    for c in data["complaints"]:
        if c["id"] == cid:
            if body.get("status"):
                c["status"] = body["status"]
            if "admin_note" in body:
                c["admin_note"] = body["admin_note"]
            save_data(data)
            return {"ok": True, "complaint": c}
    return {"message": "गुनासो भेटिएन।"}, 404

@app.get("/uploads/<path:name>")
def uploads(name):
    return send_from_directory(UPLOADS, name)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)