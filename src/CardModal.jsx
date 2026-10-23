// popup for viewing and editing a card
import { useEffect, useState } from 'react';
import { useCategories } from './categories.js';
import { toInputValue, fromInputValue } from './deadline.js';
import HistoryLog from './HistoryLog.jsx';

export default function CardModal({ card, columns, columnId, readOnly, onSave, onDelete, onClose }) {
  const categories = useCategories();
  // editable copies of the card's fields
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState(card.priority);
  const [category, setCategory] = useState(card.category ?? 'other');
  const [column, setColumn] = useState(columnId);
  const [deadline, setDeadline] = useState(toInputValue(card.deadline));
  // delete confirmation and history panel toggles
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // escape closes the history panel first, then the popup
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showHistory) setShowHistory(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, showHistory]);

  // save changes and the chosen column
  const submit = (e) => {
    e.preventDefault();
    if (readOnly || !title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), priority, category, deadline: fromInputValue(deadline) }, column);
  };

  // click outside the popup to close
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-label={readOnly ? 'Card details' : 'Edit card'}>
        {/* heading and history button */}
        <div className="modal-title">
          <h2>{readOnly ? 'Card details' : 'Edit card'}</h2>
          <button type="button" className="btn ghost small" onClick={() => setShowHistory((s) => !s)} aria-expanded={showHistory}>
            History
          </button>
        </div>
        {/* history panel and read-only hint */}
        {showHistory && <HistoryLog card={card} onClose={() => setShowHistory(false)} />}
        {readOnly && <p className="modal-hint">Only admins can edit cards. You can still move it on the board.</p>}
        {/* card fields, locked for non-admins */}
        <fieldset className="modal-fields" disabled={readOnly}>
        <label>
          Title
          <input autoFocus={!readOnly} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Notes
          <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more detail…" />
        </label>
        {/* deadline with a clear button */}
        <label>
          Deadline
          <div className="deadline-input">
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            {deadline && (
              <button type="button" className="btn ghost" onClick={() => setDeadline('')}>
                Clear
              </button>
            )}
          </div>
        </label>
        {/* priority, category and column pickers */}
        <div className="modal-row">
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <label>
            Column
            <select value={column} onChange={(e) => setColumn(e.target.value)}>
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>
        </div>
        </fieldset>
        {/* users get a close button; admins get delete, cancel and save */}
        {readOnly ? (
          <div className="modal-actions">
            <span className="spacer" />
            <button type="button" className="btn primary" onClick={onClose} autoFocus>Close</button>
          </div>
        ) : (
        <div className="modal-actions">
          {/* first click asks to confirm, second click deletes */}
          <button
            type="button"
            className="btn danger"
            onClick={() => (confirmingDelete ? onDelete() : setConfirmingDelete(true))}
          >
            {confirmingDelete ? 'Click again to delete' : 'Delete'}
          </button>
          <span className="spacer" />
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={!title.trim()}>Save</button>
        </div>
        )}
      </form>
    </div>
  );
}
