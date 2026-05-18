import { FiEdit3, FiClock } from "react-icons/fi";

export default function DraftBuilder({
  prompt,
  onPromptChange,
  onGenerateDrafts,
  onLoadRecent,
  disableRecentReason
}) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Draft Builder</h2>
        <p>Enter a topic and generate drafts from Gemini.</p>
      </div>
      <textarea
        rows={4}
        className="input"
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Write a post about..."
      />
      <div className="actions">
        <button className="btn primary block" onClick={onGenerateDrafts} disabled={!prompt.trim()}>
          <span className="btn-content">
            <FiEdit3 className="btn-icon" aria-hidden="true" />
            <span>Generate Drafts</span>
          </span>
        </button>
        <div className="tooltip">
          <button className="btn" onClick={onLoadRecent} disabled>
            <span className="btn-content">
              <FiClock className="btn-icon" aria-hidden="true" />
              <span>Load Recent Posts</span>
            </span>
          </button>
          <span className="tooltip-text">{disableRecentReason}</span>
        </div>
      </div>
    </section>
  );
}
