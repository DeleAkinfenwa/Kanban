// full-page sky behind the board, fading between day and night with the theme
export default function Sky() {
  return (
    <div className="sky" aria-hidden="true">
      {/* daytime sun and clouds */}
      <div className="sky-day">
        <div className="sun" />
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
        <div className="cloud cloud-4" />
      </div>
      {/* nighttime stars and moon */}
      <div className="sky-night">
        <div className="stars stars-small" />
        <div className="stars stars-mid" />
        <div className="stars stars-large" />
        <div className="moon" />
      </div>
    </div>
  );
}
