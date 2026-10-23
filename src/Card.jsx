// reusable card shown in each column
import { categoryOf, catProps, useCategories } from './categories.js';
import { deadlineText, formatDeadlineDate } from './deadline.js';
import { ROLE_LABEL } from './identity.js';

// display names for each priority level
const PRIORITY_LABEL = { low: 'Low', medium: 'Medium', high: 'High' };

export default function Card({ card, now, done, dragging, onDragStart, onDragEnd, onOpen, onMoveLeft, onMoveRight }) {
  // category colors and live deadline countdown (hidden once done)
  const category = categoryOf(card, useCategories());
  const cat = catProps(category);
  const deadline = card.deadline && !done ? deadlineText(card.deadline, now) : null;
  // whole card is clickable, draggable and keyboard friendly
  return (
    <article
      className={`card ${cat.className}${dragging ? ' dragging' : ''}`}
      style={cat.style}
      data-card-id={card.id}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open card: ${card.title} (${category.label})`}
    >
      {/* who last moved the card */}
      {card.placedBy && (
        <div className="placed-by" title="Who moved this card here">
          {ROLE_LABEL[card.placedBy.role]}: {card.placedBy.name}
        </div>
      )}
      {/* tags, deadline and arrow buttons */}
      <div className="card-top">
        <div className="tags">
          <span className={`priority priority-${card.priority}`}>{PRIORITY_LABEL[card.priority]}</span>
          <span className="category-label">{category.label}</span>
        </div>
        {/* countdown or overdue badge */}
        {deadline && (
          <span
            className={`deadline${deadline.overdue ? ' overdue' : ''}`}
            title={`Due ${formatDeadlineDate(card.deadline)}`}
          >
            {deadline.text}
          </span>
        )}
        {/* arrow buttons for moving without dragging */}
        <div className="move-buttons" onClick={(e) => e.stopPropagation()}>
          {onMoveLeft && (
            <button className="icon-btn" onClick={onMoveLeft} aria-label="Move to previous column" title="Move left">
              ←
            </button>
          )}
          {onMoveRight && (
            <button className="icon-btn" onClick={onMoveRight} aria-label="Move to next column" title="Move right">
              →
            </button>
          )}
        </div>
      </div>
      {/* card title and notes */}
      <h3 className="card-title">{card.title}</h3>
      {card.description && <p className="card-desc">{card.description}</p>}
    </article>
  );
}
