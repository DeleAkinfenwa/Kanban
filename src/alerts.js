import { useEffect, useRef, useState } from 'react';

// deadline alerts: in-page toasts plus browser notifications, only while the board is open
const PREF_KEY = 'kanban-board:alerts';
const SENT_KEY = 'kanban-board:alerts-sent';
// warn this long before a deadline
export const SOON_MS = 15 * 60 * 1000;
const STALE_MS = 60 * 60 * 1000; // don't announce deadlines that passed more than an hour ago

// whether this browser has notifications, and the current permission
const supported = () => typeof window !== 'undefined' && 'Notification' in window;
const permission = () => (supported() ? Notification.permission : 'unsupported');

// safe localStorage read and write helpers
function readJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable: alerts may repeat after a reload
  }
}

// hook that watches deadlines and fires alerts
export function useDeadlineAlerts({ board, now, onOpenCard }) {
  // on/off setting, browser permission and visible toasts
  const [enabled, setEnabled] = useState(() => readJSON(PREF_KEY, false) === true);
  const [perm, setPerm] = useState(permission);
  const [toasts, setToasts] = useState([]);
  // alerts already sent, and the latest open-card handler
  const sent = useRef(new Set(readJSON(SENT_KEY, [])));
  const openRef = useRef(onOpenCard);
  openRef.current = onOpenCard;

  // remember the on/off setting
  useEffect(() => writeJSON(PREF_KEY, enabled), [enabled]);

  // turn alerts on or off, asking for notification permission the first time
  const toggle = async () => {
    if (enabled) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
    if (supported() && Notification.permission === 'default') {
      try {
        setPerm(await Notification.requestPermission());
      } catch {
        setPerm(permission());
      }
    }
  };

  // remove one toast
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // check each card's deadline every tick and alert once per stage
  useEffect(() => {
    if (!enabled) return;
    const doneIds = new Set(board.columns.find((c) => c.id === 'done')?.cardIds ?? []);
    const columnTitle = (id) => board.columns.find((c) => c.cardIds.includes(id))?.title;
    let changed = false;

    for (const card of Object.values(board.cards)) {
      // skip cards with no deadline or already done
      if (!card.deadline || doneIds.has(card.id)) continue;
      // due if just passed, soon if within 15 minutes
      const left = card.deadline - now;
      let kind = null;
      if (left <= 0 && left > -STALE_MS) kind = 'due';
      else if (left > 0 && left <= SOON_MS) kind = 'soon';
      if (!kind) continue;

      const key = `${card.id}:${card.deadline}:${kind}`;
      // once a deadline has passed, the "soon" alert is no longer worth sending
      if (sent.current.has(key) || (kind === 'soon' && sent.current.has(`${card.id}:${card.deadline}:due`))) continue;
      sent.current.add(key);
      changed = true;

      // build the alert text
      const mins = Math.max(1, Math.ceil(left / 60000));
      const title = kind === 'due' ? `Deadline passed: ${card.title}` : `Due in ${mins} minute${mins === 1 ? '' : 's'}: ${card.title}`;
      const body = `${columnTitle(card.id) ?? ''} · ${card.priority[0].toUpperCase()}${card.priority.slice(1)} priority`;

      // show a toast, keeping only the latest four
      setToasts((t) => [...t, { id: key, cardId: card.id, title, body, kind }].slice(-4));

      // also send a browser notification when the board isn't in focus
      const windowActive = document.visibilityState === 'visible' && document.hasFocus();
      if (supported() && Notification.permission === 'granted' && !windowActive) {
        try {
          const n = new Notification(title, { body, tag: key });
          n.onclick = () => {
            window.focus();
            openRef.current(card.id);
            n.close();
          };
        } catch {
          // some browsers only allow notifications from a service worker; the toast still shows
        }
      }
    }
    // save which alerts were sent so reloads don't repeat them
    if (changed) writeJSON(SENT_KEY, [...sent.current].slice(-200));
  }, [enabled, board, now]);

  return { enabled, permission: perm, toggle, toasts, dismiss };
}
