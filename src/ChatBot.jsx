import { useState, useRef, useEffect } from "react";

/* ─── Groq API call ────────────────────────────────────────────────────── */
async function callGroq(messages, apiKey) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

/* ─── System prompt builder ────────────────────────────────────────────── */
function buildSystemPrompt(allData, lang) {
  const byGerai = {};
  allData.forEach(d => { byGerai[d.gerai] = (byGerai[d.gerai] || 0) + 1; });
  const kecamatanList = [...new Set(allData.map(d => d.kecamatan))].sort();

  if (lang === "en") {
    return `You are MiniBot, a helpful assistant for the MiniMap Bandung app — a geospatial information system for minimarket distribution in Bandung City, West Java, Indonesia.

KEY DATA:
- Total minimarket locations: ${allData.length}
- Indomaret: ${byGerai["INDOMARET"] || 0} stores | Alfamart: ${byGerai["ALFAMART"] || 0} stores | Yomart: ${byGerai["YOMART"] || 0} stores | Circle K: ${byGerai["CIRCLE K"] || 0} stores | Lawson: ${byGerai["LAWSON"] || 0} stores
- Districts covered: ${kecamatanList.join(", ")}
- Data source: TPBW (Tata Pangan Berbasis Wilayah) 2026

WHAT YOU CAN HELP WITH:
- Information about minimarket chains (Indomaret, Alfamart, Yomart, Lawson, Circle K)
- Store locations, districts, opening hours
- Current promotions and official websites
- How to use the MiniMap app features (map, statistics, profile, promo pages)
- General questions about minimarkets in Bandung

OFFICIAL WEBSITES:
- Indomaret: indomaret.co.id | Alfamart: alfamart.co.id | Yomart: yomart.co.id | Lawson: lawsonindonesia.com | Circle K: circlek.co.id

Be concise, friendly, and helpful. Answer in English. If asked about specific addresses or real-time data beyond what you have, guide users to use the interactive map.`;
  }

  return `Kamu adalah MiniBot, asisten cerdas untuk aplikasi MiniMap Bandung — sistem informasi geospasial persebaran minimarket di Kota Bandung, Jawa Barat.

DATA UTAMA APLIKASI:
- Total lokasi minimarket: ${allData.length} titik
- Indomaret: ${byGerai["INDOMARET"] || 0} gerai | Alfamart: ${byGerai["ALFAMART"] || 0} gerai | Yomart: ${byGerai["YOMART"] || 0} gerai | Circle K: ${byGerai["CIRCLE K"] || 0} gerai | Lawson: ${byGerai["LAWSON"] || 0} gerai
- Kecamatan tercakup: ${kecamatanList.join(", ")}
- Sumber data: TPBW (Tata Pangan Berbasis Wilayah) 2024

TOPIK YANG BISA KAMU BANTU:
- Informasi jaringan minimarket (Indomaret, Alfamart, Yomart, Lawson, Circle K)
- Lokasi gerai, kecamatan, jam buka/tutup
- Promo terkini dan website resmi masing-masing gerai
- Cara menggunakan fitur aplikasi MiniMap (peta, statistik, profil, promo)
- Pertanyaan umum seputar minimarket di Bandung

WEBSITE RESMI:
- Indomaret: indomaret.co.id | Alfamart: alfamart.co.id | Yomart: yomart.co.id | Lawson: lawsonindonesia.com | Circle K: circlek.co.id

PROFIL SINGKAT:
- Indomaret (1988): Waralaba minimarket terbesar Indonesia, 21.000+ gerai, Salim Group
- Alfamart (1999): Tbk listed IDX:AMRT, 17.000+ gerai, program Alfagift
- Yomart (2003): Satu-satunya minimarket besar lahir di Bandung, ±285 gerai Jabar, Yogya Group
- Lawson (2011 di Indonesia): Convenience store Jepang, onigiri & bento, PT Midi Utama
- Circle K (1986 di Indonesia): Convenience store internasional USA, 24 jam, Couche-Tard

Jawab dengan ramah, ringkas, dan informatif dalam Bahasa Indonesia. Jika ditanya lokasi spesifik atau data real-time, arahkan pengguna ke fitur peta interaktif.`;
}

/* ─── Suggestion chips ─────────────────────────────────────────────────── */
const SUGGESTIONS_ID = [
  "Berapa total minimarket di Bandung?",
  "Apa perbedaan Indomaret dan Alfamart?",
  "Ceritakan tentang Yomart",
  "Minimarket mana yang buka 24 jam?",
  "Promo apa yang ada sekarang?",
  "Bagaimana cara pakai fitur peta?",
];
const SUGGESTIONS_EN = [
  "How many minimarkets are in Bandung?",
  "What's the difference between Indomaret and Alfamart?",
  "Tell me about Yomart",
  "Which minimarkets are open 24 hours?",
  "What promos are available now?",
  "How do I use the map feature?",
];

/* ─── Icons ────────────────────────────────────────────────────────────── */
const IcoSend  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcoBot   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="5" r="1"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="12" y1="16" x2="12" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>;
const IcoClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoKey   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>;

/* ─── Typing indicator ─────────────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="cb-typing">
      <span/><span/><span/>
    </div>
  );
}

/* ─── Message bubble ───────────────────────────────────────────────────── */
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`cb-msg ${isUser ? "cb-msg-user" : "cb-msg-bot"}`}>
      {!isUser && (
        <div className="cb-avatar">
          <IcoBot/>
        </div>
      )}
      <div className={`cb-bubble ${isUser ? "bubble-user" : "bubble-bot"}`}>
        {msg.content.split("\n").map((line, i) => (
          <span key={i}>{line}{i < msg.content.split("\n").length - 1 && <br/>}</span>
        ))}
        <span className="cb-time">
          {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

/* ─── API Key Setup ────────────────────────────────────────────────────── */
function ApiKeySetup({ onSave, lang }) {
  const [key, setKey] = useState("");
  return (
    <div className="cb-setup">
      <div className="cb-setup-icon">🔑</div>
      <h4>{lang === "id" ? "Masukkan Groq API Key" : "Enter Groq API Key"}</h4>
      <p>{lang === "id"
        ? "Dapatkan API key gratis di console.groq.com untuk mengaktifkan MiniBot"
        : "Get a free API key at console.groq.com to activate MiniBot"}</p>
      <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="cb-setup-link">
        console.groq.com →
      </a>
      <input
        type="password"
        placeholder="gsk_..."
        value={key}
        onChange={e => setKey(e.target.value)}
        className="cb-setup-input"
        onKeyDown={e => e.key === "Enter" && key.startsWith("gsk") && onSave(key)}
      />
      <button
        className="cb-setup-btn"
        disabled={!key.startsWith("gsk")}
        onClick={() => onSave(key)}>
        {lang === "id" ? "Aktifkan MiniBot" : "Activate MiniBot"}
      </button>
    </div>
  );
}

/* ─── Main ChatBot component ───────────────────────────────────────────── */
export default function ChatBot({ allData, lang }) {
  const [open,     setOpen]     = useState(false);
  const [apiKey,   setApiKey]   = useState(() => localStorage.getItem("groq_api_key") || "");
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [showKey,  setShowKey]  = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const suggestions = lang === "en" ? SUGGESTIONS_EN : SUGGESTIONS_ID;

  // Greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const greet = lang === "id"
        ? `Halo! Saya **MiniBot** 🤖\n\nSaya siap membantu kamu menemukan informasi tentang ${allData.length} minimarket di Kota Bandung — mulai dari lokasi, jam buka, promo, hingga profil lengkap setiap jaringan.\n\nAda yang bisa saya bantu?`
        : `Hello! I'm **MiniBot** 🤖\n\nI'm here to help you explore ${allData.length} minimarkets in Bandung City — from locations and opening hours to promos and chain profiles.\n\nHow can I help you?`;
      setMessages([{ role: "assistant", content: greet, ts: Date.now() }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveApiKey = (key) => {
    localStorage.setItem("groq_api_key", key);
    setApiKey(key);
    setShowKey(false);
  };

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");
    setError(null);

    const newMessages = [...messages, { role: "user", content: userMsg, ts: Date.now() }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
      const systemPrompt = buildSystemPrompt(allData, lang);
      const groqMessages = [{ role: "system", content: systemPrompt }, ...history];

      const reply = await callGroq(groqMessages, apiKey);
      setMessages(prev => [...prev, { role: "assistant", content: reply, ts: Date.now() }]);
    } catch (err) {
      setError(err.message);
      if (err.message.includes("401") || err.message.includes("invalid_api_key")) {
        localStorage.removeItem("groq_api_key");
        setApiKey("");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setTimeout(() => {
      const greet = lang === "id"
        ? `Halo lagi! Ada yang bisa saya bantu? 😊`
        : `Hello again! How can I help? 😊`;
      setMessages([{ role: "assistant", content: greet, ts: Date.now() }]);
    }, 100);
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={`cb-fab ${open ? "cb-fab-open" : ""}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Open MiniBot Chat">
        {open ? <IcoClose/> : <IcoBot/>}
        {!open && <span className="cb-fab-label">MiniBot</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="cb-window">
          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-left">
              <div className="cb-header-avatar"><IcoBot/></div>
              <div>
                <p className="cb-header-name">MiniBot</p>
                <p className="cb-header-sub">
                  {loading
                    ? (lang === "id" ? "Sedang mengetik..." : "Typing...")
                    : (apiKey ? "● Online" : (lang === "id" ? "○ Perlu API Key" : "○ Need API Key"))}
                </p>
              </div>
            </div>
            <div className="cb-header-actions">
              <button className="cb-hdr-btn" onClick={() => setShowKey(v => !v)} title="API Key">
                <IcoKey/>
              </button>
              <button className="cb-hdr-btn" onClick={clearChat} title="Clear chat">
                🗑
              </button>
              <button className="cb-hdr-btn" onClick={() => setOpen(false)}>
                <IcoClose/>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="cb-body">
            {/* API key setup */}
            {(!apiKey || showKey) ? (
              <ApiKeySetup onSave={saveApiKey} lang={lang}/>
            ) : (
              <>
                {/* Messages */}
                <div className="cb-messages">
                  {messages.map((m, i) => <MessageBubble key={i} msg={m}/>)}
                  {loading && (
                    <div className="cb-msg cb-msg-bot">
                      <div className="cb-avatar"><IcoBot/></div>
                      <TypingDots/>
                    </div>
                  )}
                  {error && (
                    <div className="cb-error">
                      ⚠ {error}
                    </div>
                  )}
                  <div ref={bottomRef}/>
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && (
                  <div className="cb-suggestions">
                    {suggestions.map((s, i) => (
                      <button key={i} className="cb-chip" onClick={() => sendMessage(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          {apiKey && !showKey && (
            <div className="cb-input-row">
              <input
                ref={inputRef}
                type="text"
                placeholder={lang === "id" ? "Tanya sesuatu..." : "Ask something..."}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                disabled={loading}
                className="cb-input"
              />
              <button
                className="cb-send"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}>
                <IcoSend/>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
