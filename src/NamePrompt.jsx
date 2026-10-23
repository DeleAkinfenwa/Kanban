// popup asking for the user's name
import { useEffect, useState } from 'react';

export default function NamePrompt({ role, onSubmit, onCancel }) {
  const [name, setName] = useState('');

  // cancel on escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  // submit the trimmed name
  const submit = (e) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  // click outside to cancel
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <form className="modal confirm" onSubmit={submit} role="dialog" aria-modal="true" aria-label="Enter your name">
        <h2>What's your name?</h2>
        <p className="modal-hint">
          Cards you move will show "{role}: {name.trim() || 'your name'}". We'll use this name until you close the tab.
        </p>
        {/* name input */}
        <input
          id="session-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          maxLength={40}
        />
        {/* cancel and continue buttons */}
        <div className="modal-actions">
          <span className="spacer" />
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn primary" disabled={!name.trim()}>Continue</button>
        </div>
      </form>
    </div>
  );
}
