import { useState } from "react";
import { ArrowDownToLine, Check, ChevronDown, FileAudio, FileVideo, Link2, Moon, ShieldCheck, Sparkles, Sun, Upload, XCircle } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type Format = { id: string; label: string; type: "video" | "audio"; quality?: string; mime: string; size?: number };
type Result = { id: string; title: string; source: string; duration?: string; thumbnail?: string; formats: Format[]; note?: string };

function App() {
  const [dark, setDark] = useState(true);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function analyze() {
    setError(""); setResult(null); setMessage("");
    if (!/^https?:\/\/[^\s]+$/i.test(url.trim())) {
      setError("Please enter a valid media URL.");
      return;
    }
    setBusy(true);
    setMessage("Checking URL...");
    try {
      setMessage("Identifying source...");
      const r = await fetch(`${API}/api/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Unable to analyze this URL.");
      setMessage("Preparing download options...");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); setMessage(""); }
  }

  async function download(format: Format) {
    if (!result) return;
    setError(""); setMessage("Preparing file...");
    try {
      const r = await fetch(`${API}/api/download`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: result.id, formatId: format.id })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Download could not be prepared.");
      window.location.href = data.downloadUrl.startsWith("http") ? data.downloadUrl : `${API}${data.downloadUrl}`;
      setMessage("Download ready.");
      setTimeout(() => setMessage(""), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setMessage("");
    }
  }

  return <div className={dark ? "app dark" : "app light"}>
    <header className="nav">
      <a className="brand" href="#home"><span className="logo"><ArrowDownToLine size={21}/></span> MediaFlow</a>
      <nav>
        <a href="#how">How It Works</a><a href="#sources">Sources</a><a href="#faq">FAQ</a>
        <button className="icon-btn" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      </nav>
    </header>

    <main id="home">
      <section className="hero">
        <div className="glow one"></div><div className="glow two"></div>
        <div className="eyebrow"><Sparkles size={14}/> Permission-first media tools</div>
        <h1>Download Your Media,<br/><span>Your Way.</span></h1>
        <p className="lead">Paste a supported video or audio URL and retrieve media you own or have permission to use.</p>
        <div className="search-card">
          <div className="input-wrap"><Link2 size={20}/><input aria-label="Media URL" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} placeholder="Paste video or audio URL..." /><button className="paste" onClick={async()=>{try{setUrl(await navigator.clipboard.readText())}catch{}}}><Upload size={16}/> Paste</button></div>
          <button className="analyze" onClick={analyze} disabled={busy}>{busy ? <span className="spinner"/> : <ArrowDownToLine size={18}/>} {busy ? "Analyzing..." : "Analyze URL"}</button>
        </div>
        <div className="notice"><ShieldCheck size={15}/> Only download content you own or have permission to download.</div>
        {message && <div className="status">{message}</div>}
        {error && <div className="error"><XCircle size={17}/>{error}</div>}
      </section>

      {result && <section className="result section">
        <div className="section-head"><div><span className="eyebrow">READY</span><h2>{result.title}</h2><p>{result.source}{result.duration ? ` · ${result.duration}` : ""}</p></div><span className="verified"><Check size={15}/> Provider confirmed</span></div>
        <div className="result-grid">
          <div className="thumb"><div className="thumb-icon"><FileVideo size={42}/></div></div>
          <div className="formats">
            {result.formats.map(f => <div className="format" key={f.id}>
              <div className="format-icon">{f.type === "video" ? <FileVideo/> : <FileAudio/>}</div>
              <div className="format-info"><strong>{f.label}</strong><span>{f.quality || f.type.toUpperCase()} · {f.mime}</span></div>
              <button onClick={() => download(f)}><ArrowDownToLine size={17}/> Download</button>
            </div>)}
          </div>
        </div>
        {result.note && <p className="result-note">{result.note}</p>}
      </section>}

      <section id="how" className="section features">
        <div className="eyebrow">HOW IT WORKS</div><h2>Simple by design.</h2>
        <div className="cards">
          <Feature n="01" title="Paste" text="Add a URL from a supported, authorized source." icon={<Link2/>}/>
          <Feature n="02" title="Analyze" text="MediaFlow validates the URL and retrieves permitted metadata." icon={<ShieldCheck/>}/>
          <Feature n="03" title="Download" text="Choose an available format and receive a temporary download." icon={<ArrowDownToLine/>}/>
        </div>
      </section>

      <section id="sources" className="section sources"><div><div className="eyebrow">SUPPORTED SOURCES</div><h2>Provider-ready architecture.</h2><p>Only providers with an authorized integration are enabled. New integrations can be added without rewriting the application.</p></div><div className="source-box"><Check/> Demo Provider <span>Active for testing</span><br/><span className="muted">Add your approved provider adapters in <code>backend/src/integrations/</code>.</span></div></section>

      <section id="faq" className="section faq"><div className="eyebrow">FAQ</div><h2>Questions, answered.</h2><details><summary>Can I download private videos?</summary><p>No. Private or login-protected content is not supported.</p></details><details><summary>Can I download copyrighted media?</summary><p>Only where you have the necessary rights or permission and the provider authorizes the operation.</p></details><details><summary>Why is my URL unsupported?</summary><p>MediaFlow only enables explicitly registered and authorized providers.</p></details><details><summary>Are files stored permanently?</summary><p>The architecture uses temporary downloads and is designed to remove temporary files after expiry.</p></details></section>
    </main>

    <footer><div className="brand"><span className="logo"><ArrowDownToLine size={18}/></span> MediaFlow</div><p>Your media. Your rights. Your download.</p><div className="footer-links"><a href="#privacy">Privacy</a><a href="#terms">Terms</a><a href="#report">Report</a></div></footer>
  </div>
}

function Feature({n,title,text,icon}:{n:string,title:string,text:string,icon:React.ReactNode}) {
  return <div className="feature-card"><div className="feature-top"><span>{n}</span><div className="feature-icon">{icon}</div></div><h3>{title}</h3><p>{text}</p></div>
}
export default App;
