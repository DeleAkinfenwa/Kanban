// popover listing a card's creation, moves and edits
import { ROLE_LABEL } from './identity.js';

// display names for history actions
const ACTION_LABEL = { created: 'Created', edited: 'Edited', moved: 'Moved' };

// date and time shown on each entry
const formatTime = (ts) =>
  new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

// "Admin: Sam" style label for who did it
const who = (e) => (e.role ? `${ROLE_LABEL[e.role]}: ${e.name}` : e.name);

// one line of history
function Entry({ e }) {
  return (
    <li>
      <div className="history-line">
        <strong>{ACTION_LABEL[e.action] ?? e.action}</strong>
        {e.detail && <span> {e.detail}</span>}
      </div>
      <div className="history-meta">
        {who(e)} · <time dateTime={new Date(e.at).toISOString()}>{formatTime(e.at)}</time>
      </div>
    </li>
  );
}

export default function HistoryLog({ card, onClose }) {
  const history = card.history ?? [];
  // creation always shows first, falling back to the card's own timestamp
  const created =
    history.find((e) => e.action === 'created') ??
    { action: 'created', name: 'Unknown', role: null, at: card.createdAt ?? Date.now(), detail: '(before history was tracked)' };
  const activity = history.filter((e) => e.action !== 'created').reverse();

  return (
    <div className="history-popover" role="dialog" aria-label="Card history">
      {/* title and close button */}
      <div className="history-head">
        <h3>History</h3>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close history">✕</button>
      </div>
      {/* creation entry */}
      <ol className="history-list history-created">
        <Entry e={created} />
      </ol>
      {/* moves and edits, newest first */}
      <h4 className="history-subhead">Moves and edits</h4>
      {activity.length === 0 ? (
        <p className="history-empty">None yet.</p>
      ) : (
        <ol className="history-list">
          {activity.map((e, i) => (
            <Entry key={i} e={e} />
          ))}
        </ol>
      )}
    </div>
  );
}
