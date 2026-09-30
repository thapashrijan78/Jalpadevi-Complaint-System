import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import QRCode from "qrcode";

import {
AlertCircle,
CheckCircle2,
ChevronRight,
FileText,
Home as HomeIcon,
Image as ImageIcon,
LogIn,
Menu,
Mic,
MicOff,
Paperclip,
QrCode,
RefreshCw,
Search,
Send,
ShieldCheck,
UserRound,
Volume2,
X
} from "lucide-react";

import "./styles.css";
import logo from "./assets/school-logo.png";

const API = "http://localhost:5000/api";

const roles = [
"विद्यार्थी",
"शिक्षक",
"अभिभावक"
];

const categories = [
"शिक्षा तथा अध्यापन",
"विद्यालय पूर्वाधार",
"खानेपानी तथा सरसफाइ",
"सुरक्षा तथा अनुशासन",
"छात्रवृत्ति तथा सेवा",
"अन्य"
];

function App() {
const [route, setRoute] = useState(location.hash || "#home");

useEffect(() => {
const f = () => setRoute(location.hash || "#home");

addEventListener("hashchange", f);

return () => removeEventListener("hashchange", f);

}, []);

const go = (x) => {
location.hash = x;
};

return (
<> <Header go={go} />

  {route === "#complaint" ? (
    <Complaint go={go} />
  ) : route === "#status" ? (
    <Status />
  ) : route === "#login" ? (
    <Login go={go} />
  ) : route === "#dashboard" ? (
    <Dashboard go={go} />
  ) : route === "#qr" ? (
    <QR />
  ) : (
    <Home go={go} />
  )}

  <Footer />
</>

);
}

function Header({ go }) {
const [open, setOpen] = useState(false);

return ( <header className="header"> <div className="nav">

    <button
      className="school-brand"
      onClick={() => go("#home")}
    >
      <img src={logo} alt="विद्यालय लोगो" />

      <div>
        <strong>
          श्री जाल्पादेवी माध्यमिक विद्यालय
        </strong>

        <span>
          बडीमालिका–१, खेटीपाटल, बाजुरा
        </span>
      </div>
    </button>

    <button
      className="mobile-menu"
      onClick={() => setOpen(!open)}
    >
      {open ? <X /> : <Menu />}
    </button>

    <nav className={open ? "nav-open" : ""}>

      <a
        onClick={() => {
          go("#home");
          setOpen(false);
        }}
      >
        मुख्य पृष्ठ
      </a>

      <a
        onClick={() => {
          go("#status");
          setOpen(false);
        }}
      >
        गुनासोको अवस्था
      </a>

      <a
        onClick={() => {
          go("#qr");
          setOpen(false);
        }}
      >
        QR कोड
      </a>

      <a
        className="admin-link"
        onClick={() => {
          go("#login");
          setOpen(false);
        }}
      >
        <ShieldCheck size={16} />
        प्रशासन
      </a>

    </nav>
  </div>
</header>

);
}

function Home({ go }) {
return ( <main>

  <section className="hero">

    <div className="hero-copy">

      <span className="eyebrow">
        गुनासो दर्ता प्रणाली
      </span>

      <h1>
        तपाईंको आवाज,
        <br />
        <em>हाम्रो जिम्मेवारी।</em>
      </h1>

      <p>
        विद्यार्थी, शिक्षक तथा अभिभावकले विद्यालयसँग सम्बन्धित
        समस्या, सुझाव वा गुनासो सुरक्षित रूपमा दर्ता गर्न सक्नुहुन्छ।
      </p>

      <div className="hero-actions">

        <button
          className="primary"
          onClick={() => go("#complaint")}
        >
          <Send size={18} />
          गुनासो दर्ता गर्नुहोस्
        </button>

        <button
          className="outline"
          onClick={() => go("#status")}
        >
          गुनासोको अवस्था हेर्नुहोस्
          <ChevronRight size={17} />
        </button>

      </div>

    </div>

    <div className="hero-art">

      <div className="seal">
        <img src={logo} alt="विद्यालय लोगो" />
      </div>

      <div className="art-card">
        <ShieldCheck size={28} />

        <b>
          सिधै प्रशासनसम्म
        </b>

        <span>
          हरेक गुनासोलाई दर्ता नम्बर प्रदान गरिन्छ।
        </span>
      </div>

    </div>

  </section>

  <section className="features">

    <div className="section-head">

      <span className="eyebrow">
        हामी के दिन्छौँ?
      </span>

      <h2>
        सजिलो, सुरक्षित र पहुँचयोग्य
      </h2>

    </div>

    <div className="feature-grid">

      <Feature
        icon={<UserRound />}
        title="विद्यार्थी, शिक्षक र अभिभावक"
        text="तीनै समूहले एउटै पोर्टलबाट गुनासो पठाउन सक्छन्।"
      />

      <Feature
        icon={<Mic />}
        title="आवाजबाट गुनासो"
        text="टाइप गर्न गाह्रो भए मोबाइल वा कम्प्युटरबाट आवाज रेकर्ड गर्नुहोस्।"
      />

      <Feature
        icon={<Paperclip />}
        title="फोटो तथा कागजात"
        text="समस्यासँग सम्बन्धित फोटो वा PDF/JPG/PNG संलग्न गर्नुहोस्।"
      />

      <Feature
        icon={<ShieldCheck />}
        title="गोपनीय विकल्प"
        text="आफ्नो पहिचान नखुलाई अनामिक रूपमा गुनासो पठाउन सकिन्छ।"
      />

    </div>

  </section>

  <section className="how">

    <div>
      <span className="eyebrow">
        कसरी काम गर्छ?
      </span>

      <h2>
        तीन सरल चरण
      </h2>
    </div>

    <div className="steps">

      <Step
        n="१"
        title="गुनासो लेख्नुहोस्"
        text="आफ्नो भूमिका, विषय, शीर्षक र समस्या लेख्नुहोस्।"
      />

      <Step
        n="२"
        title="प्रमाण संलग्न गर्नुहोस्"
        text="आवश्यक भए आवाज, फोटो वा कागजात थप्नुहोस्।"
      />

      <Step
        n="३"
        title="दर्ता नम्बर पाउनुहोस्"
        text="दर्ता नम्बर सुरक्षित राखेर पछि अवस्था जाँच गर्नुहोस्।"
      />

    </div>

  </section>

</main>

);
}

function Feature({ icon, title, text }) {
return ( <div className="feature"> <div className="icon">
{icon} </div>

  <h3>{title}</h3>

  <p>{text}</p>
</div>

);
}

function Step({ n, title, text }) {
return ( <div className="step">

  <b>{n}</b>

  <div>
    <h3>{title}</h3>
    <p>{text}</p>
  </div>

</div>

);
}

function Complaint({ go }) {

const [f, setF] = useState({
role: "विद्यार्थी",
category: "शिक्षा तथा अध्यापन",
title: "",
description: "",
name: "",
contact: "",
email: "",
location: "",
anonymous: false
});

const [voice, setVoice] = useState(null);
const [recording, setRecording] = useState(false);
const [sending, setSending] = useState(false);
const [done, setDone] = useState(null);
const [error, setError] = useState("");

const rec = useRef(null);
const chunks = useRef([]);

const update = (k, v) => {
setF((x) => ({
...x,
[k]: v
}));
};

const record = async () => {

if (recording) {
  rec.current?.stop();
  return;
}

try {

  const s =
    await navigator.mediaDevices.getUserMedia({
      audio: true
    });

  const r = new MediaRecorder(s);

  chunks.current = [];

  r.ondataavailable = (e) => {
    chunks.current.push(e.data);
  };

  r.onstop = () => {

    setVoice(
      new Blob(chunks.current, {
        type: "audio/webm"
      })
    );

    setRecording(false);

    s.getTracks().forEach((t) => t.stop());
  };

  rec.current = r;

  r.start();

  setRecording(true);

} catch {

  setError(
    "माइक्रोफोन प्रयोग गर्न अनुमति दिनुहोस्।"
  );

}

};

const submit = async (e) => {

e.preventDefault();

setError("");
setSending(true);

try {

  let attachment = "";
  let ext = "";

  const file =
    document.getElementById("attachment").files[0];

  if (file) {

    if (file.size > 10 * 1024 * 1024) {
      throw Error(
        "फाइलको आकार १० MB भन्दा बढी हुनुहुँदैन।"
      );
    }

    attachment = await toData(file);

    ext =
      "." +
      file.name
        .split(".")
        .pop()
        .toLowerCase();
  }

  let voiceData = "";

  if (voice) {
    voiceData = await toData(voice);
  }

  const r = await fetch(
    API + "/complaints",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...f,
        attachment,
        attachment_ext: ext,
        voice: voiceData
      })
    }
  );

  const d = await r.json();

  if (!r.ok) {
    throw Error(
      d.message ||
      "गुनासो पठाउन सकिएन।"
    );
  }

  setDone(d.complaint);

} catch (e) {

  setError(e.message);

} finally {

  setSending(false);

}

};

if (done) {

return (
  <main className="success-page">

    <div className="success-card">

      <CheckCircle2 size={65} />

      <span className="eyebrow">
        गुनासो सफलतापूर्वक दर्ता भयो
      </span>

      <h1>
        धन्यवाद!
      </h1>

      <p>
        तपाईंको गुनासो प्रशासनमा पठाइएको छ।
        तलको दर्ता नम्बर सुरक्षित राख्नुहोस्।
      </p>

      <div className="tracking">
        {done.id}
      </div>

      <button
        className="primary"
        onClick={() => setDone(null)}
      >
        अर्को गुनासो दर्ता गर्नुहोस्
      </button>

      <button
        className="text-button"
        onClick={() => go("#status")}
      >
        गुनासोको अवस्था हेर्नुहोस्
      </button>

    </div>

  </main>
);

}

return ( <main>

  <section className="page-title">

    <span className="eyebrow">
      गुनासो दर्ता प्रणाली
    </span>

    <h1>
      गुनासो दर्ता गर्नुहोस्
    </h1>

    <p>
      समस्या स्पष्ट रूपमा लेख्नुहोस्।
      आवश्यक भए आवाज वा प्रमाण पनि संलग्न गर्न सक्नुहुन्छ।
    </p>

  </section>

  <section className="form-card">

    <Section
      n="१"
      title="व्यक्तिगत विवरण"
      sub="गोप्य गुनासो गर्न चाहनुहुन्छ भने अनामिक विकल्प छान्नुहोस्।"
    />

    <label className="anonymous">

      <input
        type="checkbox"
        checked={f.anonymous}
        onChange={(e) =>
          update("anonymous", e.target.checked)
        }
      />

      <span>
        <b>
          म आफ्नो परिचय गोप्य राख्न चाहन्छु
        </b>

        <small>
          गोप्य गुनासोमा व्यक्तिगत विवरण प्रशासनलाई देखाइँदैन।
        </small>
      </span>

    </label>

    <div className="grid">

      <Field label="तपाईंको भूमिका" req>

        <select
          value={f.role}
          onChange={(e) =>
            update("role", e.target.value)
          }
        >
          {roles.map((x) => (
            <option key={x}>
              {x}
            </option>
          ))}
        </select>

      </Field>

      <Field
        label="नाम"
        req={!f.anonymous}
      >

        <input
          disabled={f.anonymous}
          value={f.name}
          onChange={(e) =>
            update("name", e.target.value)
          }
          placeholder="तपाईंको नाम"
        />

      </Field>

    </div>

    <div className="grid">

      <Field
        label="सम्पर्क नम्बर"
        req={!f.anonymous}
      >

        <input
          disabled={f.anonymous}
          value={f.contact}
          onChange={(e) =>
            update("contact", e.target.value)
          }
          placeholder="मोबाइल नम्बर"
        />

      </Field>

      <Field label="इमेल">

        <input
          disabled={f.anonymous}
          value={f.email}
          onChange={(e) =>
            update("email", e.target.value)
          }
          placeholder="इमेल ठेगाना (ऐच्छिक)"
        />

      </Field>

    </div>

    <Field label="ठेगाना / कक्षा / स्थान">

      <input
        value={f.location}
        onChange={(e) =>
          update("location", e.target.value)
        }
        placeholder="समस्या भएको स्थान"
      />

    </Field>

    <Section
      n="२"
      title="गुनासोको विवरण"
      sub="सम्बन्धित विषय र समस्या स्पष्ट रूपमा लेख्नुहोस्।"
    />

    <div className="grid">

      <Field label="गुनासोको विषय" req>

        <select
          value={f.category}
          onChange={(e) =>
            update("category", e.target.value)
          }
        >
          {categories.map((x) => (
            <option key={x}>
              {x}
            </option>
          ))}
        </select>

      </Field>

      <Field label="गुनासोको शीर्षक" req>

        <input
          required
          value={f.title}
          onChange={(e) =>
            update("title", e.target.value)
          }
          placeholder="गुनासोको छोटो शीर्षक"
        />

      </Field>

    </div>

    <Field label="गुनासोको विवरण" req>

      <textarea
        required
        maxLength={2000}
        rows="7"
        value={f.description}
        onChange={(e) =>
          update("description", e.target.value)
        }
        placeholder="आफ्नो गुनासो स्पष्ट रूपमा लेख्नुहोस्..."
      />

      <small className="counter">
        {f.description.length} / २०००
      </small>

    </Field>

    <div className="voice-box">

      <div className="box-title">

        <Mic />

        <div>
          <b>
            आवाजबाट गुनासो गर्नुहोस्
          </b>

          <small>
            अधिकतम ५ मिनेटसम्म आवाज रेकर्ड गर्न सकिन्छ।
          </small>
        </div>

      </div>

      <button
        type="button"
        className={
          recording
            ? "stop-record"
            : "record-button"
        }
        onClick={record}
      >

        {recording ? (
          <>
            <MicOff />
            रेकर्डिङ रोक्नुहोस्
          </>
        ) : (
          <>
            <Mic />
            रेकर्ड सुरु गर्नुहोस्
          </>
        )}

      </button>

      {voice && (
        <audio
          controls
          src={URL.createObjectURL(voice)}
        />
      )}

    </div>

    <div className="upload-box">

      <div className="box-title">

        <Paperclip />

        <div>
          <b>
            कागजात/तस्बिर संलग्न गर्नुहोस्
          </b>

          <small>
            PDF, JPG, JPEG वा PNG — अधिकतम १० MB
          </small>
        </div>

      </div>

      <label className="file-button">

        <Paperclip />
        फाइल छान्नुहोस्

        <input
          id="attachment"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
        />

      </label>

    </div>

    {error && (
      <div className="error">

        <AlertCircle size={18} />

        {error}

      </div>
    )}

    <button
      disabled={sending}
      className="primary submit-button"
      onClick={submit}
    >

      {sending ? (
        "पठाउँदै..."
      ) : (
        <>
          <Send />
          गुनासो पठाउनुहोस्
        </>
      )}

    </button>

  </section>

</main>

);
}

function Section({ n, title, sub }) {

return ( <div className="form-section">

  <b>{n}</b>

  <div>
    <h2>{title}</h2>
    <p>{sub}</p>
  </div>

</div>

);
}

function Field({ label, req, children }) {

return ( <label className="field">

  {label}

  {req && <i> *</i>}

  {children}

</label>

);
}

const toData = (f) =>
new Promise((res, rej) => {

const r = new FileReader();

r.onload = () => res(r.result);

r.onerror = rej;

r.readAsDataURL(f);

});

function Status() {

const [id, setId] = useState("");
const [result, setResult] = useState(null);
const [error, setError] = useState("");

async function search(e) {

e.preventDefault();

setError("");
setResult(null);

try {

  const r = await fetch(
    API +
    "/complaints/" +
    encodeURIComponent(id)
  );

  const d = await r.json();

  if (!r.ok) {

    setError(
      "यो दर्ता नम्बर भेटिएन।"
    );

  } else {

    setResult(d.complaint);

  }

} catch {

  setError(
    "सर्भरसँग सम्पर्क हुन सकेन।"
  );

}

}

return ( <main>

  <section className="page-title">

    <span className="eyebrow">
      गुनासोको अवस्था
    </span>

    <h1>
      आफ्नो गुनासो खोज्नुहोस्
    </h1>

    <p>
      दर्ता गर्दा प्राप्त भएको Tracking ID यहाँ लेख्नुहोस्।
    </p>

  </section>

  <section className="status-card">

    <form onSubmit={search}>

      <label className="field">

        दर्ता नम्बर

        <input
          required
          value={id}
          onChange={(e) =>
            setId(e.target.value)
          }
          placeholder="उदाहरण: गु-20260917-ABC123"
        />

        <button className="primary">

          <Search />

          खोज्नुहोस्

        </button>

      </label>

    </form>

    {error && (
      <div className="error">

        <AlertCircle />

        {error}

      </div>
    )}

    {result && (
      <div className="status-result">

        <span className="status-pill">
          {result.status}
        </span>

        <h2>
          {result.title}
        </h2>

        <p>
          {result.description}
        </p>

        <div className="status-meta">

          <span>
            विषय: {result.category}
          </span>

          <span>
            दर्ता:{" "}
            {new Date(
              result.created_at
            ).toLocaleString("ne-NP")}
          </span>

        </div>

      </div>
    )}

  </section>

</main>

);
}

function Login({ go }) {

const [u, setU] = useState("");
const [p, setP] = useState("");
const [err, setErr] = useState("");

async function submit(e) {

e.preventDefault();

setErr("");

try {

  const r = await fetch(
    API + "/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: u,
        password: p
      })
    }
  );

  const d = await r.json();

  if (r.ok) {

    sessionStorage.setItem(
      "adminToken",
      d.token
    );

    go("#dashboard");

  } else {

    setErr(
      d.message ||
      "लगइन गर्न सकिएन।"
    );

  }

} catch {

  setErr(
    "सर्भरसँग सम्पर्क हुन सकेन।"
  );

}

}

return ( <main className="center">

  <div className="login-card">

    <div className="login-icon">
      <ShieldCheck />
    </div>

    <span className="eyebrow">
      डिजिटल प्रशासन
    </span>

    <h1>
      प्रशासन लगइन
    </h1>

    <p>
      विद्यालयका प्राप्त गुनासाहरू व्यवस्थापन गर्न लगइन गर्नुहोस्।
    </p>

    <form onSubmit={submit}>

      <Field
        label="प्रयोगकर्ता नाम"
        req
      >

        <input
          required
          value={u}
          onChange={(e) =>
            setU(e.target.value)
          }
          placeholder="प्रयोगकर्ता नाम"
        />

      </Field>

      <Field
        label="पासवर्ड"
        req
      >

        <input
          required
          type="password"
          value={p}
          onChange={(e) =>
            setP(e.target.value)
          }
          placeholder="पासवर्ड"
        />

      </Field>

      {err && (
        <div className="error">

          <AlertCircle />

          {err}

        </div>
      )}

      <button className="primary submit-button">

        <LogIn />

        लगइन गर्नुहोस्

      </button>

    </form>

    <small className="demo">
      Demo: admin / admin123
    </small>

  </div>

</main>

);
}

function Dashboard({ go }) {

const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState("सबै");
const [query, setQuery] = useState("");
const [error, setError] = useState("");

const load = async () => {

setLoading(true);
setError("");

try {

  const r = await fetch(
    API + "/complaints",
    {
      headers: {
        Authorization:
          "Bearer " +
          sessionStorage.getItem(
            "adminToken"
          )
      }
    }
  );

  if (r.status === 401) {

    go("#login");
    return;

  }

  if (!r.ok) {
    throw Error("गुनासाहरू लोड गर्न सकिएन।");
  }

  const d = await r.json();

  setItems(d.complaints || []);

} catch {

  setItems([]);
  setError("सर्भरसँग सम्पर्क हुन सकेन। फेरि प्रयास गर्नुहोस्।");

} finally {

  setLoading(false);

}

};

useEffect(() => {
load();
}, []);

const list = items.filter(
(c) =>
(filter === "सबै" ||
c.status === filter) &&
(
c.id +
c.title +
c.description +
c.category +
c.role
)
.toLowerCase()
.includes(query.toLowerCase())
);

const change = async (id, status) => {

const r = await fetch(
  API + "/complaints/" + id,
  {
    method: "PATCH",
    headers: {
      Authorization:
        "Bearer " +
        sessionStorage.getItem(
          "adminToken"
        ),
      "Content-Type":
        "application/json"
    },
    body: JSON.stringify({
      status
    })
  }
);

if (!r.ok) {
  setError("गुनासोको अवस्था परिवर्तन गर्न सकिएन।");
  return;
}

load();

};

const saveNote = async (id, admin_note) => {

const r = await fetch(
  API + "/complaints/" + id,
  {
    method: "PATCH",
    headers: {
      Authorization:
        "Bearer " +
        sessionStorage.getItem("adminToken"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ admin_note })
  }
);

if (!r.ok) {
  setError("प्रशासनिक टिप्पणी सुरक्षित गर्न सकिएन।");
}

};

if (loading) {
return ( <main className="center">
लोड हुँदैछ… </main>
);
}

return ( <main>

  <section className="dash-head">

    <div>

      <span className="eyebrow">
        डिजिटल प्रशासन
      </span>

      <h1>
        गुनासो व्यवस्थापन
      </h1>

      <p>
        प्राप्त गुनासाहरू हेर्नुहोस्,
        खोज्नुहोस् र अवस्था परिवर्तन गर्नुहोस्।
      </p>

    </div>

    <div className="dash-actions">
      <button
        className="outline"
        onClick={load}
      >
        <RefreshCw size={16} />
        पुनः लोड
      </button>

      <button
        className="outline"
        onClick={() => {
        sessionStorage.removeItem(
          "adminToken"
        );

        go("#login");
        }}
      >
        लगआउट
      </button>
    </div>

  </section>

  {error && (
    <div className="dashboard-error">
      <AlertCircle size={18} />
      {error}
    </div>
  )}

  <section className="stats">

    <Stat
      n={items.length}
      t="कुल गुनासो"
    />

    <Stat
      n={
        items.filter(
          (x) =>
            x.status === "दर्ता भयो"
        ).length
      }
      t="नयाँ"
    />

    <Stat
      n={
        items.filter(
          (x) =>
            x.status === "छानबिनमा"
        ).length
      }
      t="छानबिनमा"
    />

    <Stat
      n={
        items.filter(
          (x) =>
            x.status === "समाधान भयो"
        ).length
      }
      t="समाधान भयो"
    />

  </section>

  <section className="dash-tools">

    <div className="search">

      <Search />

      <input
        placeholder="गुनासो खोज्नुहोस्..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
      />

    </div>

    <div className="filters">

      {[
        "सबै",
        "दर्ता भयो",
        "छानबिनमा",
        "समाधान भयो"
      ].map((x) => (

        <button
          key={x}
          className={
            filter === x
              ? "active"
              : ""
          }
          onClick={() =>
            setFilter(x)
          }
        >
          {x}
        </button>

      ))}

    </div>

  </section>

  <section className="admin-list">

    {list.map((c) => (

      <article
        className="admin-card"
        key={c.id}
      >

        <div className="admin-top">

          <div>

            <small>
              {c.id} · {c.role}
            </small>

            <h2>
              {c.title}
            </h2>

          </div>

          <select
            value={c.status}
            onChange={(e) =>
              change(
                c.id,
                e.target.value
              )
            }
          >
            <option>
              दर्ता भयो
            </option>

            <option>
              छानबिनमा
            </option>

            <option>
              समाधान भयो
            </option>

          </select>

        </div>

        <p>
          {c.description}
        </p>

        <div className="admin-meta">

          <span>
            {c.category}
          </span>

          <span>
            {c.location ||
              "स्थान उल्लेख छैन"}
          </span>

          <span>
            {c.anonymous
              ? "अनामिक"
              : "पहिचान खुलाइएको"}
          </span>

          {!c.anonymous && (c.name || c.contact) && (
            <span>
              {c.name || "नाम छैन"} · {c.contact || "सम्पर्क छैन"}
            </span>
          )}

          <span>
            {new Date(
              c.created_at
            ).toLocaleString("ne-NP")}
          </span>

        </div>

        {c.voice_name && (
          <audio
            controls
            src={
              "http://localhost:5000/uploads/" +
              c.voice_name
            }
          />
        )}

        {c.image_name && (
          <a
            href={
              "http://localhost:5000/uploads/" +
              c.image_name
            }
            target="_blank"
            rel="noreferrer"
          >
            <FileText size={15} />
            संलग्न फाइल हेर्नुहोस्
          </a>
        )}

        <label className="admin-note">
          प्रशासनिक टिप्पणी
          <textarea
            defaultValue={c.admin_note || ""}
            placeholder="यस गुनासोबारे आन्तरिक टिप्पणी लेख्नुहोस्..."
            rows="2"
            onBlur={(e) =>
              saveNote(c.id, e.target.value)
            }
          />
        </label>

      </article>

    ))}

    {!list.length && (
      <div className="empty">
        कुनै गुनासो भेटिएन।
      </div>
    )}

  </section>

</main>

);
}

function Stat({ n, t }) {

return ( <div className="stat">

  <b>{n}</b>

  <span>{t}</span>

</div>

);
}

function QR() {

const [url, setUrl] = useState(
window.location.origin +
window.location.pathname +
"#complaint"
);

const [img, setImg] = useState("");

useEffect(() => {

QRCode.toDataURL(
  url,
  {
    width: 600,
    margin: 3,
    errorCorrectionLevel: "H"
  }
).then(setImg);

}, [url]);

return ( <main>

  <section className="qr-page">

    <div>

      <span className="eyebrow">
        सार्वजनिक पहुँच
      </span>

      <h1>
        QR कोडबाट गुनासो दर्ता
      </h1>

      <p>
        विद्यालय, कक्षा, सूचना पाटी वा समुदायमा
        QR कोड राख्नुहोस्। स्क्यान गरेपछि
        विद्यार्थी/अभिभावक सिधै गुनासो पृष्ठमा पुग्छन्।
      </p>

      <label className="field">
        const [error, setError] = useState("");

        सार्वजनिक गुनासो URL
          setLoading(true);
          setError("");

        <input
          value={url}
          onChange={(e) =>
            setUrl(e.target.value)
          }
        />

      </label>

      <p className="muted">
        वेबसाइट deploy गरेपछि यहाँ आफ्नो live URL राख्नुहोस्।
      </p>

      {img && (
        <a
          className="primary download"
          download="jalpa-devi-complaint-qr.png"
          href={img}
        >
          QR कोड डाउनलोड गर्नुहोस्
        </a>
      )}

            setError("सर्भरसँग सम्पर्क हुन सकेन। फेरि प्रयास गर्नुहोस्।");
    </div>

    <div className="qr-card">

      {img ? (
        <img
          src={img}
          alt="Complaint QR Code"
        />
      ) : (
        <QrCode size={190} />
      )}

      <b>
        गुनासो दर्ता गर्न स्क्यान गर्नुहोस्
      </b>

      <span>
        श्री जाल्पादेवी माध्यमिक विद्यालय
      </span>

    </div>

  </section>

</main>

);
}

function Footer() {

return ( <footer>

  <div>

    <img
      src={logo}
      alt="विद्यालय लोगो"
    />

    <div>

      <b>
          श्री जाल्पादेवी माध्यमिक विद्यालय
      </b>

      <span>
        बडीमालिका–१, खेटीपाटल, बाजुरा
      </span>

    </div>

  </div>

  <span>
    गुनासो दर्ता प्रणाली · सार्वजनिक सेवा
  </span>

</footer>

);
}

createRoot(
document.getElementById("root")
).render( <App />
);
