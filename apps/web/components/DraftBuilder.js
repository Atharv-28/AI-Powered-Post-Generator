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
        <button className="btn primary" onClick={onGenerateDrafts} disabled={!prompt.trim()}>
          Generate Drafts
        </button>
        <div className="tooltip">
          <button className="btn" onClick={onLoadRecent} disabled>
            Load Recent Posts
          </button>
          <span className="tooltip-text">{disableRecentReason}</span>
        </div>
      </div>
    </section>
  );
}
