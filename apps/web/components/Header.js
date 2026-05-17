export default function Header({ connected, onConnect }) {
  const subtitle = connected
    ? "Connected. Generate drafts and publish to LinkedIn."
    : "Connect your LinkedIn account, generate drafts, and publish.";

  return (
    <header className="hero">
      <div className="hero-top">
        <div className="brand">
          <span className="badge">LinkedIn</span>
          <span className="badge alt">Gemini</span>
        </div>
        <button className={`btn ${connected ? "success" : ""}`} onClick={onConnect}>
          {connected ? "Connected" : "Connect LinkedIn"}
        </button>
      </div>
      <h1>LinkedIn + AI Post Generator</h1>
      <p className="subtitle">{subtitle}</p>
      <div className="status-row">
        {connected ? <span className="pill ok">Connected</span> : <span className="pill">Not connected</span>}
      </div>
    </header>
  );
}
