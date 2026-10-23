// deadline countdowns, formatting and date input helpers
import { useEffect, useState } from 'react';

// time units in milliseconds
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// "1 day" vs "2 days"
const plural = (n, unit) => `${n} ${unit}${n === 1 ? '' : 's'}`;

// "4 days, 7 hours" / "3 hours, 12 minutes" / "8 minutes"
export function formatDuration(ms) {
  const days = Math.floor(ms / DAY);
  const hours = Math.floor((ms % DAY) / HOUR);
  const minutes = Math.floor((ms % HOUR) / MINUTE);
  if (days > 0) return hours ? `${plural(days, 'day')}, ${plural(hours, 'hour')}` : plural(days, 'day');
  if (hours > 0) return minutes ? `${plural(hours, 'hour')}, ${plural(minutes, 'minute')}` : plural(hours, 'hour');
  return plural(Math.max(minutes, 1), 'minute');
}

// countdown text, or how long overdue
export function deadlineText(deadline, now) {
  const diff = deadline - now;
  return diff >= 0
    ? { text: `Deadline: ${formatDuration(diff)}`, overdue: false }
    : { text: `Overdue by ${formatDuration(-diff)}`, overdue: true };
}

// timestamp to value for a datetime-local input, in the viewer's time zone
export function toInputValue(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return new Date(d.getTime() - d.getTimezoneOffset() * MINUTE).toISOString().slice(0, 16);
}

// parse the date input back into a timestamp
export function fromInputValue(value) {
  if (!value) return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
}

// full due date shown on hover
export const formatDeadlineDate = (ts) =>
  new Date(ts).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

// current time, refreshed every 30 seconds so countdowns stay live
export function useNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export { DAY, HOUR };
