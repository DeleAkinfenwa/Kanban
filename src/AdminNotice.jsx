// popup telling users that only admins can do this
import { useEffect } from 'react';

export default function AdminNotice({ what = 'create cards', onClose }) {
  // close on escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // click outside the box to close
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal confirm" role="alertdialog" aria-modal="true" aria-labelledby="admin-notice-title">
        <h2 id="admin-notice-title">Only admins can {what}</h2>
        <p>
          You're using the board as a User. To {what === 'create cards' ? 'add a card' : what}, click <strong>Become Admin</strong> at the top of the
          page, then try again.
        </p>
        {/* dismiss button */}
        <div className="modal-actions">
          <span className="spacer" />
          <button type="button" className="btn primary" autoFocus onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
