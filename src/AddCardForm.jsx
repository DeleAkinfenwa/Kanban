// form for adding a new card to a column
import { useState } from 'react';
import { useCategories } from './categories.js';
import { fromInputValue } from './deadline.js';

export default function AddCardForm({ onAdd, canAdd, onBlocked }) {
  // open state and field values
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('coding');
  const [deadline, setDeadline] = useState('');

  // just the add button when closed or when the user can't add
  if (!open || !canAdd) {
    return (
      <button className="add-card" onClick={() => (canAdd ? setOpen(true) : onBlocked())}>
        + Add card
      </button>
    );
  }

  // add the card, then clear the fields for the next one
  const submit = (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onAdd({ title: t, priority, category, deadline: fromInputValue(deadline) });
    setTitle('');
    setDeadline('');
  };

  // title, priority, category and deadline fields
  return (
    <form className="add-form" onSubmit={submit}>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        placeholder="What needs doing?"
        aria-label="New card title"
      />
      {/* priority and category pickers */}
      <div className="add-form-row">
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {useCategories().map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>
      {/* optional deadline picker */}
      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        aria-label="Deadline (optional)"
        title="Deadline (optional)"
      />
      {/* add and cancel buttons */}
      <div className="add-form-row">
        <button type="submit" className="btn primary" disabled={!title.trim()}>
          Add
        </button>
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
