export default function ToastStack({ toasts, onClose }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-body">
            <span className="toast-text">{toast.message}</span>
            <button className="toast-close" onClick={() => onClose(toast.id)} aria-label="Dismiss">
              ×
            </button>
          </div>
          <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
        </div>
      ))}
    </div>
  );
}
