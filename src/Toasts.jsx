// pop-up deadline alerts in the corner of the page
export default function Toasts({ toasts, onOpen, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          {/* click an alert to open its card */}
          <button type="button" className="toast-body" onClick={() => { onOpen(t.cardId); onDismiss(t.id); }}>
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </button>
          {/* dismiss button */}
          <button type="button" className="icon-btn" onClick={() => onDismiss(t.id)} aria-label="Dismiss alert">✕</button>
        </div>
      ))}
    </div>
  );
}
