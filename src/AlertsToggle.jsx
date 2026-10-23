// header button that turns deadline alerts on and off
// bell icon, crossed out when alerts are off
const BellIcon = ({ off }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

export default function AlertsToggle({ enabled, permission, onToggle }) {
  // tooltip text depends on alert setting and browser permission
  let title;
  if (!enabled) title = 'Turn on deadline alerts';
  else if (permission === 'granted') title = 'Deadline alerts on (browser notifications + on-page alerts). Click to turn off';
  else if (permission === 'denied') title = 'Deadline alerts on, on this page only. Browser notifications are blocked: allow them in your browser\'s site settings. Click to turn off';
  else if (permission === 'unsupported') title = 'Deadline alerts on, on this page only (this browser has no notifications). Click to turn off';
  else title = 'Deadline alerts on. Click to turn off';

  return (
    <button
      type="button"
      className={`theme-toggle alerts-toggle${enabled ? ' on' : ''}`}
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={title}
      title={title}
    >
      <BellIcon off={!enabled} />
    </button>
  );
}
