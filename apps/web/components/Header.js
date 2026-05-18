import { useEffect, useRef } from "react";
import { FiLink } from "react-icons/fi";

export default function Header({ connected, onConnect }) {
  const connectButtonRef = useRef(null);
  const subtitle = connected
    ? "Connected. Generate drafts and publish to LinkedIn."
    : "Connect your LinkedIn account, generate drafts, and publish.";

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  return (
    <header className="hero">
      <div className="hero-top">
        <div className="brand">
          <span className="badge">LinkedIn</span>
          <span className="badge alt">Gemini</span>
        </div>
        <button
          className={`btn ${connected ? "success" : "attention"}`}
          onClick={onConnect}
          ref={connectButtonRef}
        >
          <span className="btn-content">
            <FiLink className="btn-icon" aria-hidden="true" />
            <span>{connected ? "Connected" : "Connect LinkedIn"}</span>
          </span>
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
