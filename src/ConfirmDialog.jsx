// yes/no popup for risky actions
import { useEffect } from 'react';

export default function ConfirmDialog({ message, confirmLabel, onConfirm, onCancel }) {
  // cancel on escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // click outside to cancel
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal confirm" role="alertdialog" aria-modal="true" aria-label="Confirm">
        <p>{message}</p>
        {/* cancel and confirm buttons */}
        <div className="modal-actions">
          <span className="spacer" />
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn danger-solid" autoFocus onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
