from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
from datetime import datetime, timezone
import json
import uuid
import base64
import smtplib
import os
import shutil
from email.message import EmailMessage

# ============================================================
# PATHS
# ============================================================

BASE = Path(__file__).resolve().parent
# PythonAnywhere installs the committed production build under backend/static.
# Local/other deployments can continue to use frontend/dist.
STATIC_BUILD = BASE / "static"
FRONTEND_DIST = STATIC_BUILD if (STATIC_BUILD / "index.html").is_file() else BASE.parent / "frontend" / "dist"
STORAGE = Path(os.environ.get("STORAGE_DIR", str(BASE))).resolve()
STORAGE.mkdir(parents=True, exist_ok=True)

DATA = STORAGE / "data.json"
UPLOADS = STORAGE / "uploads"

UPLOADS.mkdir(exist_ok=True)

# Seed persistent storage once with any bundled demo data and uploads.
if not DATA.exists():
    bundled_data = BASE / "data.json"
    if bundled_data.exists():
        shutil.copy2(bundled_data, DATA)
    else:
        DATA.write_text(json.dumps({"complaints": []}, ensure_ascii=False, indent=2), encoding="utf-8")
    bundled_uploads = BASE / "uploads"
    if bundled_uploads.exists():
        for item in bundled_uploads.iterdir():
            if item.is_file() and not (UPLOADS / item.name).exists():
                shutil.copy2(item, UPLOADS / item.name)


# ============================================================
# FLASK APP
# ============================================================

app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIST / "assets"),
    static_url_path="/assets",
)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024

allowed_origins = [origin.strip() for origin in os.environ.get("CORS_ORIGINS", "*").split(",") if origin.strip()]
CORS(
    app,
    resources={
        r"/api/*": {"origins": allowed_origins},
        r"/uploads/*": {"origins": allowed_origins},
    },
    supports_credentials=False,
)


# ============================================================
# ADMIN CONFIGURATION
# ============================================================

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

ADMIN_EMAILS = set(filter(None, (email.strip().lower() for email in os.environ.get(
    "ADMIN_EMAILS", "hemrajpanditjee@gmail.com,karkipadam948@gmail.com"
).split(","))))

# This token is returned after successful login.
# The frontend uses it for protected admin requests.
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "jalpa-demo-admin-token")


# ============================================================
# EMAIL CONFIGURATION
# ============================================================

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# IMPORTANT:
# Replace these with your actual Gmail address and Gmail App Password.
#
# Do NOT commit a real password/App Password to GitHub.
#
SENDER_EMAIL = "example@gmail.com"
SENDER_PASSWORD = "xxxx xxxx xxxx xxxx"

# Emails that receive new complaint notifications
NOTIFICATION_EMAILS = [
    "hemrajpanditjee@gmail.com",
    "karkipadam948@gmail.com",
]


# ============================================================
# DATA HELPERS
# ============================================================

def load_data():
    try:
        return json.loads(
            DATA.read_text(encoding="utf-8")
        )
    except Exception:
        return {"complaints": []}


def save_data(data):
    DATA.write_text(
        json.dumps(
            data,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )


# ============================================================
# AUTHENTICATION
# ============================================================

def authorized():
    """
    Check whether the request contains the admin token.
    """

    authorization = request.headers.get("Authorization", "")

    expected = f"Bearer {ADMIN_TOKEN}"

    return authorization == expected


# ============================================================
# EMAIL NOTIFICATION
# ============================================================

def send_admin_notification(complaint):
    """
    Send an email notification when a new complaint is created.

    If email configuration is not valid, the complaint itself
    is still saved successfully.
    """

    # Don't attempt SMTP with placeholder credentials.
    if (
        not SENDER_EMAIL
        or not SENDER_PASSWORD
        or SENDER_EMAIL == "example@gmail.com"
        or SENDER_PASSWORD == "xxxx xxxx xxxx xxxx"
    ):
        print(
            "Email notification skipped: "
            "SMTP credentials are not configured."
        )
        return

    try:
        msg = EmailMessage()

        msg["Subject"] = (
            f"नयाँ गुनासो दर्ता भयो: {complaint['id']}"
        )

        msg["From"] = SENDER_EMAIL

        msg["To"] = ", ".join(NOTIFICATION_EMAILS)

        body = f"""
नयाँ गुनासो प्राप्त भएको छ।

दर्ता नम्बर: {complaint['id']}
भूमिका: {complaint['role']}
विषय: {complaint['category']}
शीर्षक: {complaint['title']}

विवरण:
{complaint['description']}

स्थान:
{complaint.get('location', '')}

कृपया व्यवस्थापन गर्न प्रशासन ड्यासबोर्डमा लगइन गर्नुहोस्।
"""

        msg.set_content(body)

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT
        ) as server:

            server.starttls()

            server.login(
                SENDER_EMAIL,
                SENDER_PASSWORD
            )

            server.send_message(msg)

        print(
            f"Email sent successfully for complaint "
            f"{complaint['id']}"
        )

    except Exception as e:
        print(
            f"Failed to send email notification: {e}"
        )


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return jsonify({
        "ok": True,
        "message": "सर्भर चलिरहेको छ।"
    })


# ============================================================
# ADMIN LOGIN
# ============================================================

@app.post("/api/auth/login")
def login():

    body = request.get_json(silent=True) or {}

    email = str(
        body.get("email", "")
    ).strip().lower()

    username = str(
        body.get("username", "")
    ).strip().lower()

    password = str(
        body.get("password", "")
    )

    # --------------------------------------------------------
    # Email-based login
    # --------------------------------------------------------

    valid_email = (
        email in ADMIN_EMAILS
    )

    # --------------------------------------------------------
    # Backward compatibility:
    # allow username "admin"
    # --------------------------------------------------------

    valid_username = (
        username == "admin"
    )

    # --------------------------------------------------------
    # Password
    # --------------------------------------------------------

    valid_password = (
        password == ADMIN_PASSWORD
    )

    if (valid_email or valid_username) and valid_password:

        logged_in_email = (
            email
            if email in ADMIN_EMAILS
            else "admin"
        )

        return jsonify({
            "ok": True,
            "token": ADMIN_TOKEN,
            "email": logged_in_email
        })

    return jsonify({
        "ok": False,
        "message": "इमेल/प्रयोगकर्ता नाम वा पासवर्ड मिलेन।"
    }), 401


# ============================================================
# CREATE COMPLAINT
# ============================================================

@app.post("/api/complaints")
def create_complaint():

    body = request.get_json(silent=True) or {}

    required = [
        "role",
        "category",
        "title",
        "description"
    ]

    missing = [
        field
        for field in required
        if not body.get(field)
    ]

    if missing:
        return jsonify({
            "message": "कृपया आवश्यक विवरण पूरा गर्नुहोस्।",
            "missing": missing
        }), 400

    # --------------------------------------------------------
    # Complaint ID
    # --------------------------------------------------------

    cid = (
        "गु-"
        + datetime.now().strftime("%Y%m%d")
        + "-"
        + uuid.uuid4().hex[:6].upper()
    )

    now = datetime.now(
        timezone.utc
    ).isoformat()

    anonymous = bool(
        body.get("anonymous")
    )

    # --------------------------------------------------------
    # Complaint object
    # --------------------------------------------------------

    complaint = {
        "id": cid,

        "created_at": now,

        "role": body.get("role", ""),

        "category": body.get("category", ""),

        "title": str(
            body.get("title", "")
        ).strip(),

        "description": str(
            body.get("description", "")
        ).strip(),

        "name": (
            ""
            if anonymous
            else body.get("name", "")
        ),

        "contact": (
            ""
            if anonymous
            else body.get("contact", "")
        ),

        "email": (
            ""
            if anonymous
            else body.get("email", "")
        ),

        "location": body.get(
            "location",
            ""
        ),

        "anonymous": anonymous,

        "image_name": "",

        "attachment_name": "",

        "voice_name": "",

        "status": "opened",

        "admin_note": ""
    }


    # ========================================================
    # FILE ATTACHMENT
    # ========================================================

    attachment = body.get(
        "attachment"
    )

    if attachment and "," in attachment:

        try:

            ext = str(
                body.get(
                    "attachment_ext",
                    ".jpg"
                )
            ).lower()

            allowed_extensions = [
                ".jpg",
                ".jpeg",
                ".png",
                ".pdf"
            ]

            if ext not in allowed_extensions:
                ext = ".jpg"

            encoded_data = attachment.split(
                ",",
                1
            )[1]

            raw = base64.b64decode(
                encoded_data
            )

            if len(raw) <= 10 * 1024 * 1024:

                filename = (
                    f"{cid}-file{ext}"
                )

                path = UPLOADS / filename

                path.write_bytes(raw)

                complaint["image_name"] = filename

                complaint["attachment_name"] = filename

        except Exception as e:

            print(
                f"Attachment processing failed: {e}"
            )


    # ========================================================
    # VOICE ATTACHMENT
    # ========================================================

    voice = body.get("voice")

    if voice and "," in voice:

        try:

            encoded_data = voice.split(
                ",",
                1
            )[1]

            raw = base64.b64decode(
                encoded_data
            )

            if len(raw) <= 15 * 1024 * 1024:

                filename = (
                    f"{cid}-voice.webm"
                )

                path = UPLOADS / filename

                path.write_bytes(raw)

                complaint["voice_name"] = filename

        except Exception as e:

            print(
                f"Voice processing failed: {e}"
            )


    # ========================================================
    # SAVE COMPLAINT
    # ========================================================

    data = load_data()

    if "complaints" not in data:
        data["complaints"] = []

    data["complaints"].insert(
        0,
        complaint
    )

    save_data(data)


    # ========================================================
    # SEND EMAIL
    # ========================================================

    send_admin_notification(
        complaint
    )


    # ========================================================
    # RESPONSE
    # ========================================================

    return jsonify({
        "ok": True,
        "complaint": complaint
    }), 201


# ============================================================
# GET ALL COMPLAINTS
# ============================================================

@app.get("/api/complaints")
def get_complaints():

    if not authorized():

        return jsonify({
            "message": "अनधिकृत पहुँच।"
        }), 401

    data = load_data()

    return jsonify({
        "complaints": data.get(
            "complaints",
            []
        )
    })


# ============================================================
# GET SINGLE COMPLAINT
# ============================================================

@app.get("/api/complaints/<cid>")
def get_one(cid):

    data = load_data()

    for complaint in data.get(
        "complaints",
        []
    ):

        if complaint.get("id") == cid:

            public = dict(
                complaint
            )

            # Don't expose personal information
            public.pop(
                "name",
                None
            )

            public.pop(
                "contact",
                None
            )

            public.pop(
                "email",
                None
            )

            return jsonify({
                "complaint": public
            })

    return jsonify({
        "message": "गुनासो भेटिएन।"
    }), 404


# ============================================================
# UPDATE COMPLAINT
# ============================================================

@app.patch("/api/complaints/<cid>")
def update(cid):

    if not authorized():

        return jsonify({
            "message": "अनधिकृत पहुँच।"
        }), 401

    body = request.get_json(
        silent=True
    ) or {}

    data = load_data()

    for complaint in data.get(
        "complaints",
        []
    ):

        if complaint.get("id") == cid:

            # ------------------------------------------------
            # Status
            # ------------------------------------------------

            if "status" in body:

                status = str(
                    body.get("status", "")
                ).strip().lower()

                allowed_statuses = {
                    "opened",
                    "in_progress",
                    "closed"
                }

                if status in allowed_statuses:

                    complaint["status"] = status

            # ------------------------------------------------
            # Admin note
            # ------------------------------------------------

            if "admin_note" in body:

                complaint["admin_note"] = str(
                    body.get(
                        "admin_note",
                        ""
                    )
                )

            save_data(data)

            return jsonify({
                "ok": True,
                "complaint": complaint
            })

    return jsonify({
        "message": "गुनासो भेटिएन।"
    }), 404


# ============================================================
# SERVE UPLOADED FILES
# ============================================================

@app.get("/uploads/<path:name>")
def uploads(name):

    return send_from_directory(
        UPLOADS,
        name
    )


# ============================================================
# OPTIONAL ROOT RESPONSE
# ============================================================

@app.get("/")
def root():

    if (FRONTEND_DIST / "index.html").is_file():
        return send_from_directory(FRONTEND_DIST, "index.html")

    return jsonify({
        "ok": True,
        "message": "Jalpa Devi Complaint System API चलिरहेको छ।",
        "health": "/api/health",
        "login": "/api/auth/login"
    })


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=8000,
        debug=os.environ.get("FLASK_DEBUG", "1") == "1",
        use_reloader=False,
    )
