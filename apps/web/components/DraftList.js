import { FiRefreshCw, FiSend } from "react-icons/fi";

export default function DraftList({ drafts, editPrompts, onEditPromptChange, onRevise, onPublish }) {
  return (
    <section className="card">
      <div className="card-header">
        <h2>Drafts</h2>
        <p>Pick a draft and publish to your profile.</p>
      </div>
      <ul className="list">
        {drafts.map((draft, idx) => (
          <li key={idx} className="list-item">
            <div className="list-text">
              <div className="draft-text">{draft}</div>
              <div className="edit-row">
                <input
                  className="edit-input"
                  value={editPrompts[idx] || ""}
                  onChange={(e) => onEditPromptChange(idx, e.target.value)}
                  placeholder="Request changes (tone, length, add CTA, etc.)"
                />
                <button className="btn" onClick={() => onRevise(idx)}>
                  <span className="btn-content">
                    <FiRefreshCw className="btn-icon" aria-hidden="true" />
                    <span>Update Draft</span>
                  </span>
                </button>
              </div>
            </div>
            <button className="btn ghost" onClick={() => onPublish(draft)}>
              <span className="btn-content">
                <FiSend className="btn-icon" aria-hidden="true" />
                <span>Publish</span>
              </span>
            </button>
          </li>
        ))}
        {drafts.length === 0 ? <li className="list-empty">No drafts yet.</li> : null}
      </ul>
    </section>
  );
}
