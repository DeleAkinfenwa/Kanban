// popup to rename categories and change their colors
import { useEffect, useState } from 'react';

export default function CategoryEditor({ categories, onSave, onReset, onClose }) {
  // working copy of each category's name and color
  const [rows, setRows] = useState(() =>
    categories.map((c) => ({ id: c.id, label: c.label, color: c.color ?? c.defaultColor, defaultLabel: c.defaultLabel }))
  );

  // close on escape
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // update one field of one row; every category needs a name
  const update = (id, field, value) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const valid = rows.every((r) => r.label.trim());

  // save the edited names and colors
  const submit = (e) => {
    e.preventDefault();
    if (valid) onSave(rows.map((r) => ({ id: r.id, label: r.label.trim(), color: r.color })));
  };

  // click outside the popup to close
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="cat-editor-title">
        <h2 id="cat-editor-title">Edit categories</h2>
        <p className="modal-hint">Rename a category or pick a new color. Cards update right away.</p>
        <ul className="cat-editor">
          {/* one row per category: color picker and name */}
          {rows.map((r) => (
            <li key={r.id}>
              <input
                type="color"
                id={`cat-color-${r.id}`}
                value={r.color}
                onChange={(e) => update(r.id, 'color', e.target.value)}
                aria-label={`Color for ${r.label || r.defaultLabel}`}
              />
              <input
                type="text"
                id={`cat-name-${r.id}`}
                value={r.label}
                onChange={(e) => update(r.id, 'label', e.target.value)}
                maxLength={24}
                aria-label={`Name for the ${r.defaultLabel} category`}
                placeholder={r.defaultLabel}
              />
            </li>
          ))}
        </ul>
        {/* restore, cancel and save buttons */}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onReset}>Restore defaults</button>
          <span className="spacer" />
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={!valid}>Save</button>
        </div>
      </form>
    </div>
  );
}
