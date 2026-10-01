import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import QRCode from "qrcode";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  LogIn,
  Menu,
  MessageSquareText,
  Mic,
  MicOff,
  Paperclip,
  QrCode,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import "./styles.css";
import logo from "./assets/school_logo.jpeg";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const API = `${API_BASE_URL}/api`;
const AUTH_KEY = "jalpadevi_admin_session";


const STATUS = {
  OPENED: "opened",
  IN_PROGRESS: "in_progress",
  CLOSED: "closed",
};

const STATUS_LABELS = {
  opened: "खुला",
  in_progress: "प्रगतिमा",
  closed: "बन्द",
};

const STATUS_COLORS = {
  opened: "status-opened",
  in_progress: "status-progress",
  closed: "status-closed",
};

const roles = ["विद्यार्थी", "शिक्षक", "अभिभावक"];
const categories = [
  "शिक्षा तथा अध्यापन",
  "विद्यालय पूर्वाधार",
  "खानेपानी तथा सरसफाइ",
  "सुरक्षा तथा अनुशासन",
  "छात्रवृत्ति तथा सेवा",
  "अन्य",
];

function normalizeStatus(value) {
  if (!value) return STATUS.OPENED;
  const v = String(value).toLowerCase().trim();

  if (
    v === STATUS.CLOSED ||
    v.includes("closed") ||
    v.includes("समाधान") ||
    v.includes("बन्द")
  ) {
    return STATUS.CLOSED;
  }

  if (
    v === STATUS.IN_PROGRESS ||
    v.includes("progress") ||
    v.includes("छानबिन") ||
    v.includes("प्रगत")
  ) {
    return STATUS.IN_PROGRESS;
  }

  return STATUS.OPENED;
}

function statusLabel(value) {
  return STATUS_LABELS[normalizeStatus(value)];
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

function setSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

function authHeaders() {
  const session = getSession();
  return session?.token
    ? { Authorization: `Bearer ${session.token}` }
    : {};
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

function isValidNepalMobile(value) {
  return /^(?:\+977[-\s]?)?9[678]\d{8}$/.test(
    value.replace(/\s/g, "")
  );
}

function formatDate(value) {
  if (!value) return "मिति उपलब्ध छैन";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ne-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function apiJson(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || "सर्भर अनुरोध असफल भयो।");
  }

  return data;
}

function App() {
  const [route, setRoute] = useState(window.location.hash || "#home");
  const [session, setSessionState] = useState(getSession());

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const onStorage = () => setSessionState(getSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const go = (next) => {
    window.location.hash = next;
  };

  const logout = () => {
    clearSession();
    setSessionState(null);
    go("#login");
  };

  return (
    <div className="app-shell">
      <Header session={session} go={go} logout={logout} />

      {route === "#complaint" && <Complaint go={go} />}
      {route === "#status" && <Status />}
      {route === "#login" && (
        <Login go={go} onLogin={setSessionState} />
      )}
      {route === "#dashboard" && session && (
        <Dashboard go={go} session={session} logout={logout} />
      )}
      {route === "#dashboard" && !session && (
        <Login go={go} onLogin={setSessionState} />
      )}
      {route === "#qr" && <QR />}
      {route === "#home" && <Home go={go} />}
      {!["#home", "#complaint", "#status", "#login", "#dashboard", "#qr"].includes(route) && (
        <Home go={go} />
      )}

      <Footer />
    </div>
  );
}

function Header({ session, go, logout }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (route) => {
    go(route);
    setMobileOpen(false);
  };

  return (
    <header className="header">
      <div className="nav">

        <button className="school-brand" onClick={() => navigate("#home")}>
          <img src={logo} alt="श्री जाल्पादेवी माध्यमिक विद्यालय लोगो" />
          <span>
            <strong>श्री जाल्पादेवी माध्यमिक विद्यालय</strong>
            <small>बडीमालिका–१, खैतिपातल, बाजुरा</small>
          </span>
        </button>

        <button
          className="mobile-menu"
          aria-label="मेनु"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>

        <nav className={mobileOpen ? "nav-open" : ""}>
          <button onClick={() => navigate("#home")}>मुख्य पृष्ठ</button>
          <button onClick={() => navigate("#complaint")}>गुनासो दर्ता</button>
          <button onClick={() => navigate("#status")}>गुनासोको अवस्था</button>
          <button onClick={() => navigate("#qr")}>QR कोड</button>

          {session ? (
            <button className="nav-admin" onClick={() => navigate("#dashboard")}>
              <ShieldCheck size={16} />
              प्रशासन
            </button>
          ) : (
            <button className="nav-admin" onClick={() => navigate("#login")}>
              <LockKeyhole size={16} />
              प्रशासन लगइन
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function Home({ go }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">विद्यालय गुनासो व्यवस्थापन प्रणाली</div>
          <h1>
            तपाईंको आवाज,
            <br />
            <span>हाम्रो जिम्मेवारी।</span>
          </h1>
          <p>
            विद्यार्थी, शिक्षक तथा अभिभावकले विद्यालयसँग सम्बन्धित
            समस्या, सुझाव वा गुनासो सुरक्षित रूपमा दर्ता गर्न सक्नुहुन्छ।
          </p>

          <div className="hero-actions">
            <button className="primary" onClick={() => go("#complaint")}>
              <MessageSquareText size={19} />
              गुनासो दर्ता गर्नुहोस्
              <ChevronRight size={17} />
            </button>
            <button className="outline" onClick={() => go("#status")}>
              गुनासोको अवस्था हेर्नुहोस्
            </button>
          </div>

          <div className="hero-trust">
            <span><ShieldCheck size={16} /> सुरक्षित</span>
            <span><Users size={16} /> सबैका लागि</span>
            <span><RefreshCw size={16} /> वास्तविक अवस्था</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-glow" />
          <div className="logo-orbit">
            <div className="logo-ring">
              <img src={logo} alt="विद्यालय लोगो" />
            </div>
          </div>

          <div className="floating-card card-one">
            <CheckCircle2 size={20} />
            <div>
              <b>खुला संवाद</b>
              <span>गुनासो सजिलै दर्ता गर्नुहोस्</span>
            </div>
          </div>

          <div className="floating-card card-two">
            <Search size={20} />
            <div>
              <b>अवस्था जाँच</b>
              <span>दर्ता नम्बरबाट हेर्नुहोस्</span>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <div className="eyebrow">सरल र पारदर्शी</div>
          <h2>गुनासो व्यवस्थापनका लागि आवश्यक सबै कुरा</h2>
        </div>

        <div className="feature-grid">
          <Feature icon={<UserRound />} title="सबै प्रयोगकर्ताका लागि" text="विद्यार्थी, शिक्षक र अभिभावकले एउटै प्रणालीबाट गुनासो पठाउन सक्छन्।" />
          <Feature icon={<Mic />} title="आवाजबाट पनि" text="टाइप गर्न कठिन भए आवाज रेकर्ड गरेर समस्या पठाउन सकिन्छ।" />
          <Feature icon={<Paperclip />} title="फोटो तथा कागजात" text="सम्बन्धित प्रमाण, फोटो वा PDF संलग्न गर्न सकिन्छ।" />
          <Feature icon={<ShieldCheck />} title="गोपनीय विकल्प" text="आवश्यक परे आफ्नो पहिचान गोप्य राखेर गुनासो पठाउन सकिन्छ।" />
        </div>
      </section>

      <section className="process-section">
        <div className="section-heading">
          <div className="eyebrow">कसरी काम गर्छ?</div>
          <h2>तीन सरल चरण</h2>
        </div>

        <div className="steps-grid">
          <Step n="०१" title="गुनासो लेख्नुहोस्" text="समस्या, विषय र आवश्यक विवरण भर्नुहोस्।" />
          <Step n="०२" title="दर्ता गर्नुहोस्" text="आवश्यक परे फोटो वा आवाज पनि थप्नुहोस्।" />
          <Step n="०३" title="अवस्था हेर्नुहोस्" text="दर्ता नम्बर प्रयोग गरेर खुला, प्रगतिमा वा बन्द अवस्था हेर्नुहोस्।" />
        </div>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Step({ n, title, text }) {
  return (
    <article className="step-card">
      <div className="step-number">{n}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function Complaint({ go }) {
  const [form, setForm] = useState({
    role: "विद्यार्थी",
    category: categories[0],
    title: "",
    description: "",
    location: "",
    name: "",
    contact: "",
    email: "",
    anonymous: false,
  });

  const [attachment, setAttachment] = useState(null);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState("");
  const [recording, setRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    return () => {
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    };
  }, [voiceUrl]);

  const update = (key, value) =>
    setForm((old) => ({ ...old, [key]: value }));

  const startRecording = async () => {
    setError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("यो ब्राउजरमा आवाज रेकर्ड गर्ने सुविधा उपलब्ध छैन।");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setRecording(true);
    } catch {
      setError("माइक्रोफोन अनुमति दिनुहोस् र फेरि प्रयास गर्नुहोस्।");
    }
  };

  const stopRecording = () => {
    recorder?.stop();
    setRecorder(null);
    setRecording(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("गुनासोको शीर्षक आवश्यक छ।");
    if (form.description.trim().length < 20) {
      return setError("गुनासोको विवरण कम्तीमा २० अक्षरको हुनुपर्छ।");
    }

    if (!form.anonymous) {
      if (!form.name.trim()) return setError("कृपया आफ्नो नाम लेख्नुहोस्।");
      if (!isValidNepalMobile(form.contact)) {
        return setError("कृपया सही १० अङ्कको नेपाली मोबाइल नम्बर राख्नुहोस्।");
      }
      if (!isValidEmail(form.email)) {
        return setError("कृपया सही इमेल ठेगाना राख्नुहोस्।");
      }
    }

    if (attachment && attachment.size > 10 * 1024 * 1024) {
      return setError("संलग्न फाइल १० MB भन्दा ठूलो हुनुहुँदैन।");
    }

    setSending(true);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        contact: form.anonymous ? "" : form.contact.replace(/\s/g, ""),
        email: form.anonymous ? "" : form.email.trim().toLowerCase(),
        attachment: attachment ? await fileToDataUrl(attachment) : "",
        attachment_ext: attachment
          ? `.${attachment.name.split(".").pop().toLowerCase()}`
          : "",
        voice: voiceBlob ? await fileToDataUrl(voiceBlob) : "",
      };

      const result = await apiJson("/complaints", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSuccess(result.complaint || result);
    } catch (e) {
      setError(e.message || "गुनासो पठाउन सकिएन।");
    } finally {
      setSending(false);
    }
  };

  if (success) {
    const id = success.id || success.complaint_id || "दर्ता भयो";
    return (
      <main className="success-page">
        <div className="success-card">
          <div className="success-icon"><CheckCircle2 size={46} /></div>
          <div className="eyebrow">गुनासो सफलतापूर्वक दर्ता भयो</div>
          <h1>धन्यवाद। तपाईंको गुनासो प्राप्त भयो।</h1>
          <p>यो दर्ता नम्बर सुरक्षित राख्नुहोस्। यसैबाट गुनासोको अवस्था हेर्न सक्नुहुन्छ।</p>
          <div className="tracking-box">
            <small>दर्ता नम्बर</small>
            <strong>{id}</strong>
          </div>
          <div className="success-actions">
            <button className="primary" onClick={() => go("#status")}>
              अवस्था हेर्नुहोस्
            </button>
            <button className="outline" onClick={() => window.location.reload()}>
              अर्को गुनासो
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <section className="page-heading">
        <div>
          <div className="eyebrow">गुनासो दर्ता</div>
          <h1>आफ्नो समस्या वा सुझाव हामीलाई बताउनुहोस्।</h1>
          <p>तपाईंको विवरण सुरक्षित रूपमा विद्यालय प्रशासनसम्म पुग्नेछ।</p>
        </div>
        <div className="heading-badge"><ShieldCheck size={18} /> सुरक्षित प्रणाली</div>
      </section>

      <form className="complaint-card" onSubmit={submit}>
        {error && <ErrorBox text={error} />}

        <div className="form-section-title">
          <span>१</span>
          <div>
            <h2>गुनासोको विवरण</h2>
            <p>सम्बन्धित जानकारी सकेसम्म स्पष्ट रूपमा भर्नुहोस्।</p>
          </div>
        </div>

        <div className="form-grid two">
          <Field label="तपाईंको भूमिका" required>
            <select value={form.role} onChange={(e) => update("role", e.target.value)}>
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
          </Field>

          <Field label="विषय" required>
            <select value={form.category} onChange={(e) => update("category", e.target.value)}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </Field>
        </div>

        <Field label="गुनासोको शीर्षक" required hint={`${form.title.length}/120`}>
          <input
            maxLength={120}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="उदाहरण: कक्षाकोठामा खानेपानीको समस्या"
          />
        </Field>

        <Field label="समस्या वा गुनासोको विवरण" required hint={`${form.description.length}/2000`}>
          <textarea
            rows={7}
            maxLength={2000}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="समस्या के हो? कहिलेदेखि भइरहेको छ? आवश्यक विवरण लेख्नुहोस्..."
          />
        </Field>

        <Field label="सम्बन्धित स्थान">
          <input
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="उदाहरण: कक्षा १०, पुस्तकालय, खेलमैदान..."
          />
        </Field>

        <div className="form-section-title section-spaced">
          <span>२</span>
          <div>
            <h2>प्रमाण तथा संलग्न सामग्री</h2>
            <p>आवश्यक परे फोटो, PDF वा आवाज संलग्न गर्नुहोस्।</p>
          </div>
        </div>

        <div className="media-grid">
          <div className="media-box">
            <div className="media-title"><Mic size={19} /><div><b>आवाज रेकर्ड</b><small>आफ्नो समस्या बोल्दै पठाउनुहोस्</small></div></div>
            {!recording ? (
              <button type="button" className="outline" onClick={startRecording}>
                <Mic size={17} /> रेकर्ड सुरु गर्नुहोस्
              </button>
            ) : (
              <button type="button" className="danger" onClick={stopRecording}>
                <MicOff size={17} /> रेकर्ड रोक्नुहोस्
              </button>
            )}
            {voiceUrl && <audio controls src={voiceUrl} />}
          </div>

          <div className="media-box">
            <div className="media-title"><Paperclip size={19} /><div><b>फोटो / कागजात</b><small>JPG, PNG वा PDF · अधिकतम १० MB</small></div></div>
            <label className="file-picker">
              <Paperclip size={17} />
              <span>{attachment ? attachment.name : "फाइल छान्नुहोस्"}</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>

        <div className="form-section-title section-spaced">
          <span>३</span>
          <div>
            <h2>सम्पर्क विवरण</h2>
            <p>तपाईंलाई जवाफ आवश्यक भए यी विवरण उपयोगी हुन्छन्।</p>
          </div>
        </div>

        <label className="anonymous-toggle">
          <input
            type="checkbox"
            checked={form.anonymous}
            onChange={(e) => update("anonymous", e.target.checked)}
          />
          <span>
            <b>म आफ्नो पहिचान गोप्य राख्न चाहन्छु।</b>
            <small>अनामिक गुनासोमा नाम, मोबाइल र इमेल पठाइँदैन।</small>
          </span>
        </label>

        {!form.anonymous && (
          <div className="form-grid two">
            <Field label="पूरा नाम" required>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="तपाईंको पूरा नाम"
              />
            </Field>

            <Field label="मोबाइल नम्बर" required hint="१० अङ्क">
              <input
                inputMode="numeric"
                maxLength={10}
                value={form.contact}
                onChange={(e) => update("contact", e.target.value.replace(/\D/g, ""))}
                placeholder="98XXXXXXXX"
              />
            </Field>

            <Field label="इमेल ठेगाना" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="example@gmail.com"
              />
            </Field>
          </div>
        )}

        <div className="privacy-banner">
          <ShieldCheck size={19} />
          <span>तपाईंको व्यक्तिगत विवरण गुनासो व्यवस्थापनका लागि मात्र प्रयोग गरिनेछ।</span>
        </div>

        <button className="primary submit-button" disabled={sending}>
          {sending ? <><RefreshCw className="spin" size={18} /> पठाउँदै...</> : <><Send size={18} /> गुनासो पठाउनुहोस्</>}
        </button>
      </form>
    </main>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">
        {label} {required && <i>*</i>}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </label>
  );
}

function ErrorBox({ text }) {
  return <div className="error-box"><AlertCircle size={18} /> <span>{text}</span></div>;
}

function Status() {
  const [id, setId] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (event) => {
    event.preventDefault();
    setComplaint(null);
    setError("");

    if (!id.trim()) {
      setError("कृपया दर्ता नम्बर राख्नुहोस्।");
      return;
    }

    setLoading(true);
    try {
      const data = await apiJson(`/complaints/${encodeURIComponent(id.trim())}`);
      setComplaint(data.complaint || data);
    } catch (e) {
      setError(e.message || "गुनासो भेटिएन।");
    } finally {
      setLoading(false);
    }
  };

  const current = complaint ? normalizeStatus(complaint.status) : null;

  return (
    <main className="status-page">
      <section className="status-hero">
        <div className="eyebrow">पारदर्शी गुनासो प्रणाली</div>
        <h1>तपाईंको गुनासो अहिले कहाँ पुगेको छ?</h1>
        <p>दर्ता नम्बर राख्नुहोस् र प्रशासनले अद्यावधिक गरेको अवस्था हेर्नुहोस्।</p>

        <form className="status-search" onSubmit={search}>
          <div className="search-input">
            <Search size={19} />
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="उदाहरण: JD-2026-0001"
            />
          </div>
          <button className="primary" disabled={loading}>
            {loading ? "खोज्दै..." : "अवस्था हेर्नुहोस्"}
          </button>
        </form>

        {error && <ErrorBox text={error} />}
      </section>

      {complaint && (
        <section className="status-result-card">
          <div className="result-top">
            <div>
              <small>दर्ता नम्बर</small>
              <h2>{complaint.id}</h2>
            </div>
            <StatusBadge status={current} />
          </div>

          <div className="status-timeline">
            <StatusStep active={true} current={current} value={STATUS.OPENED} label="खुला" />
            <StatusStep active={current !== STATUS.OPENED} current={current} value={STATUS.IN_PROGRESS} label="प्रगतिमा" />
            <StatusStep active={current === STATUS.CLOSED} current={current} value={STATUS.CLOSED} label="बन्द" />
          </div>

          <div className="result-body">
            <span className="category-chip">{complaint.category}</span>
            <h3>{complaint.title}</h3>
            <p>{complaint.description}</p>

            <div className="result-meta">
              <span>भूमिका: {complaint.role}</span>
              <span>दर्ता: {formatDate(complaint.created_at)}</span>
              {complaint.location && <span>स्थान: {complaint.location}</span>}
            </div>

            {complaint.admin_note && (
              <div className="admin-response">
                <b>प्रशासनको टिप्पणी</b>
                <p>{complaint.admin_note}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function StatusStep({ active, current, value, label }) {
  const done =
    value === STATUS.OPENED
      ? true
      : value === STATUS.IN_PROGRESS
      ? current === STATUS.IN_PROGRESS || current === STATUS.CLOSED
      : current === STATUS.CLOSED;

  return (
    <div className={`timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}>
      <span>{done ? <CheckCircle2 size={17} /> : ""}</span>
      <b>{label}</b>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${STATUS_COLORS[normalizeStatus(status)]}`}>
      <span />
      {statusLabel(status)}
    </span>
  );
}

function Login({ go, onLogin }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existing = getSession();
    if (existing) go("#dashboard");
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const cleanLoginId = loginId.trim().toLowerCase();
    const isEmail = isValidEmail(cleanLoginId);

    if (!isEmail && cleanLoginId !== "admin") {
      setError("कृपया अधिकृत इमेल वा admin प्रयोगकर्ता नाम राख्नुहोस्।");
      return;
    }

    setLoading(true);

    try {
      const data = await apiJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: isEmail ? cleanLoginId : "",
          username: isEmail ? "" : cleanLoginId,
          password,
        }),
      });

      const session = {
        email: isEmail ? cleanLoginId : "admin",
        token: data.token,
        loggedInAt: Date.now(),
      };

      setSession(session);
      onLogin(session);
      go("#dashboard");
    } catch (e) {
      setError(
        e.message ||
          "लगइन असफल भयो। Backend मा यी दुई admin email/password पनि सेट भएको सुनिश्चित गर्नुहोस्।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-layout">
        <div className="login-brand-panel">
          <img src={logo} alt="विद्यालय लोगो" />
          <div className="eyebrow">ADMINISTRATION PORTAL</div>
          <h1>विद्यालय प्रशासनमा सुरक्षित प्रवेश</h1>
          <p>गुनासाहरू हेर्न, अवस्था परिवर्तन गर्न र प्रशासनिक टिप्पणी राख्न लगइन गर्नुहोस्।</p>
          <div className="login-security">
            <span><LockKeyhole size={17} /> सुरक्षित प्रशासन</span>
            <span><ShieldCheck size={17} /> अधिकृत इमेल मात्र</span>
          </div>
        </div>

        <form className="login-card" onSubmit={submit}>
          <div className="login-icon"><ShieldCheck size={25} /></div>
          <div className="eyebrow">प्रशासन लगइन</div>
          <h2>स्वागत छ</h2>
          <p>आफ्नो अधिकृत इमेल वा प्रयोगकर्ता नाम र पासवर्ड प्रयोग गर्नुहोस्।</p>

          {error && <ErrorBox text={error} />}

          <Field label="इमेल वा प्रयोगकर्ता नाम" required>
            <input
              type="text"
              autoComplete="username"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="name@gmail.com वा admin"
            />
          </Field>

          <label className="field">
            <span className="field-label">पासवर्ड <i>*</i></span>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="primary full-button" disabled={loading}>
            {loading ? <><RefreshCw className="spin" size={18} /> लगइन हुँदैछ...</> : <><LogIn size={18} /> प्रशासनमा प्रवेश</>}
          </button>

          <div className="login-note">
            <LockKeyhole size={15} />
            <span>केवल अधिकृत प्रशासनिक विवरणबाट लगइन गर्न सकिन्छ।</span>
          </div>
        </form>
      </section>
    </main>
  );
}

function Dashboard({ go, session, logout }) {
  const [items, setItems] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const principal = session.email === "hemrajpanditjee@gmail.com";
  const welcome = principal ? "स्वागत छ, प्रधानाध्यापकज्यू" : "स्वागत छ";

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiJson("/complaints", {
        headers: authHeaders(),
      });
      setItems((data.complaints || []).map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      })));
    } catch (e) {
      setError(e.message || "गुनासाहरू लोड गर्न सकिएन।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesStatus =
        selectedStatus === "all" ||
        normalizeStatus(item.status) === selectedStatus;

      const text = [
        item.id,
        item.title,
        item.description,
        item.category,
        item.role,
        item.name,
        item.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && text.includes(q);
    });
  }, [items, selectedStatus, search]);

  const counts = {
    all: items.length,
    opened: items.filter((x) => normalizeStatus(x.status) === STATUS.OPENED).length,
    in_progress: items.filter((x) => normalizeStatus(x.status) === STATUS.IN_PROGRESS).length,
    closed: items.filter((x) => normalizeStatus(x.status) === STATUS.CLOSED).length,
  };

  const updateComplaint = async (id, changes) => {
    setSavingId(id);
    setError("");

    try {
      await apiJson(`/complaints/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(changes),
      });

      await load();
    } catch (e) {
      setError(e.message || "परिवर्तन सुरक्षित गर्न सकिएन।");
    } finally {
      setSavingId("");
    }
  };

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="loading-card"><RefreshCw className="spin" /> गुनासाहरू लोड हुँदैछन्...</div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <div className="eyebrow">ADMIN DASHBOARD</div>
          <h1>{welcome}</h1>
          <p>{session.email}</p>
        </div>

        <div className="dashboard-actions">
          <button className="outline" onClick={load}><RefreshCw size={16} /> Refresh</button>
          <button className="dark-button" onClick={logout}>Logout</button>
        </div>
      </section>

      {error && <div className="dashboard-error"><AlertCircle size={18} /> {error}</div>}

      <section className="dashboard-stats">
        <StatCard label="कुल गुनासो" value={counts.all} icon={<MessageSquareText />} />
        <StatCard label="खुला" value={counts.opened} icon={<AlertCircle />} />
        <StatCard label="प्रगतिमा" value={counts.in_progress} icon={<RefreshCw />} />
        <StatCard label="बन्द" value={counts.closed} icon={<CheckCircle2 />} />
      </section>

      <section className="dashboard-toolbar">
        <div className="search-input dashboard-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ID, शीर्षक, विवरण वा विषय खोज्नुहोस्..."
          />
        </div>

        <div className="status-filters">
          {[
            ["all", "सबै"],
            [STATUS.OPENED, "खुला"],
            [STATUS.IN_PROGRESS, "प्रगतिमा"],
            [STATUS.CLOSED, "बन्द"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={selectedStatus === value ? "active" : ""}
              onClick={() => setSelectedStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="complaint-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <MessageSquareText size={32} />
            <h3>कुनै गुनासो भेटिएन</h3>
            <p>फिल्टर वा खोज शब्द परिवर्तन गरेर फेरि प्रयास गर्नुहोस्।</p>
          </div>
        )}

        {filtered.map((item) => (
          <AdminComplaintCard
            key={item.id}
            item={item}
            saving={savingId === item.id}
            onStatus={(status) => updateComplaint(item.id, { status })}
            onNote={(admin_note) => updateComplaint(item.id, { admin_note })}
          />
        ))}
      </section>
    </main>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div>
        <b>{value}</b>
        <span>{label}</span>
      </div>
    </div>
  );
}

function AdminComplaintCard({ item, saving, onStatus, onNote }) {
  const [note, setNote] = useState(item.admin_note || "");

  return (
    <article className="admin-complaint-card">
      <div className="complaint-card-top">
        <div>
          <div className="complaint-id-row">
            <span>{item.id}</span>
            <span>{formatDate(item.created_at)}</span>
          </div>
          <h2>{item.title}</h2>
        </div>

        <StatusBadge status={item.status} />
      </div>

      <div className="complaint-content">
        <span className="category-chip">{item.category}</span>
        <p>{item.description}</p>
      </div>

      <div className="complaint-meta-grid">
        <div><small>भूमिका</small><b>{item.role || "—"}</b></div>
        <div><small>नाम</small><b>{item.anonymous ? "अनामिक" : item.name || "—"}</b></div>
        <div><small>मोबाइल</small><b>{item.anonymous ? "गोप्य" : item.contact || "—"}</b></div>
        <div><small>इमेल</small><b>{item.anonymous ? "गोप्य" : item.email || "—"}</b></div>
        <div><small>स्थान</small><b>{item.location || "उल्लेख छैन"}</b></div>
      </div>

      {(item.voice_name || item.image_name || item.attachment_name) && (
        <div className="attachments">
          {item.voice_name && (
        <audio controls src={`${API_BASE_URL}/uploads/${encodeURIComponent(item.voice_name)}`} />
          )}
          {(item.image_name || item.attachment_name) && (
            <a
              href={`${API_BASE_URL}/uploads/${encodeURIComponent(item.image_name || item.attachment_name)}`}
              target="_blank"
              rel="noreferrer"
            >
              <FileText size={16} /> संलग्न फाइल हेर्नुहोस्
            </a>
          )}
        </div>
      )}

      <div className="admin-control-row">
        <div>
          <label>गुनासोको अवस्था</label>
          <select
            value={normalizeStatus(item.status)}
            disabled={saving}
            onChange={(e) => onStatus(e.target.value)}
          >
            <option value={STATUS.OPENED}>खुला</option>
            <option value={STATUS.IN_PROGRESS}>प्रगतिमा</option>
            <option value={STATUS.CLOSED}>बन्द</option>
          </select>
        </div>

        <div className="note-control">
          <label>प्रशासनिक टिप्पणी</label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => {
              if (note !== (item.admin_note || "")) onNote(note);
            }}
            placeholder="आवश्यक भए टिप्पणी लेख्नुहोस्..."
          />
        </div>
      </div>
    </article>
  );
}

function QR() {
  const [url, setUrl] = useState(
    `${window.location.origin}${window.location.pathname}#complaint`
  );
  const [qr, setQr] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 520,
      margin: 2,
      errorCorrectionLevel: "H",
    }).then(setQr);
  }, [url]);

  return (
    <main className="qr-page">
      <section className="qr-copy">
        <div className="eyebrow">PUBLIC ACCESS</div>
        <h1>QR कोडबाट गुनासो दर्ता</h1>
        <p>
          विद्यालयको सूचना पाटी, कार्यालय वा कक्षामा QR कोड राख्नुहोस्।
          स्क्यान गरेपछि प्रयोगकर्ता सिधै गुनासो दर्ता पृष्ठमा पुग्छ।
        </p>

        <Field label="गुनासो दर्ता URL">
          <input value={url} onChange={(e) => setUrl(e.target.value)} />
        </Field>

        {qr && (
          <a className="primary qr-download" href={qr} download="jalpadevi-complaint-qr.png">
            QR डाउनलोड गर्नुहोस्
          </a>
        )}
      </section>

      <section className="qr-card">
        {qr ? <img src={qr} alt="गुनासो दर्ता QR code" /> : <QrCode size={200} />}
        <b>गुनासो दर्ता गर्न स्क्यान गर्नुहोस्</b>
        <span>श्री जाल्पादेवी माध्यमिक विद्यालय</span>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <img src={logo} alt="विद्यालय लोगो" />
        <div>
          <b>श्री जाल्पादेवी माध्यमिक विद्यालय</b>
          <span>बडीमालिका–१, खैतिपातल, बाजुरा</span>
        </div>
      </div>
      <span>डिजिटल गुनासो व्यवस्थापन प्रणाली</span>
    </footer>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

createRoot(document.getElementById("root")).render(<App />);
