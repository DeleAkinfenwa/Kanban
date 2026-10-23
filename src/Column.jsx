// one board column with its cards and add form
import { useState } from 'react';
import Card from './Card.jsx';
import AddCardForm from './AddCardForm.jsx';

export default function Column({
  column, now, cards, matches, filtering, dragId, setDragId,
  onAdd, canAdd, onAddBlocked, onOpen, onMove, onClear, canClear, prevColumnId, nextColumnId,
}) {
  // drop spot for a dragged card, and cards that pass the filter
  const [dropIndex, setDropIndex] = useState(null);
  const visible = cards.filter(matches);

  // work out where the dragged card would land from the pointer position
  const handleDragOver = (e) => {
    if (!dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const els = [...e.currentTarget.querySelectorAll('[data-card-id]')];
    let index = cards.length;
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        index = cards.findIndex((c) => c.id === el.dataset.cardId);
        break;
      }
    }
    if (index !== dropIndex) setDropIndex(index);
  };

  // move the dropped card into this column at the marked spot
  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || dragId;
    if (id) onMove(id, column.id, dropIndex ?? cards.length);
    setDropIndex(null);
    setDragId(null);
  };

  // hide the drop marker when the pointer leaves the column
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDropIndex(null);
  };

  return (
    <section className={`column column-${column.id}`} aria-label={column.title}>
      {/* column title, card count and clear button */}
      <header className="column-header">
        <h2>
          {column.title}
          <span className="count">{filtering ? `${visible.length}/${cards.length}` : cards.length}</span>
        </h2>
        {/* done column gets a clear button */}
        {column.id === 'done' && canClear && cards.length > 0 && (
          <button
            className="btn link"
            onClick={onClear}
          >
            Clear
          </button>
        )}
      </header>

      {/* card list and drop target */}
      <div
        className={`card-list${dropIndex !== null ? ' drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {cards.map((card, i) => (
          <div key={card.id} className="slot">
            {/* line showing where the card will land */}
            {dropIndex === i && <div className="drop-marker" />}
            {matches(card) && (
              <Card
                card={card}
                now={now}
                done={column.id === 'done'}
                dragging={dragId === card.id}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', card.id);
                  e.dataTransfer.effectAllowed = 'move';
                  setDragId(card.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDropIndex(null);
                }}
                onOpen={() => onOpen(card.id)}
                onMoveLeft={prevColumnId && (() => onMove(card.id, prevColumnId))}
                onMoveRight={nextColumnId && (() => onMove(card.id, nextColumnId))}
              />
            )}
          </div>
        ))}
        {/* end drop marker and empty states */}
        {dropIndex === cards.length && <div className="drop-marker" />}
        {cards.length === 0 && <p className="empty">Drop cards here</p>}
        {filtering && cards.length > 0 && visible.length === 0 && <p className="empty">No matches</p>}
      </div>

      {/* add card button and form */}
      <AddCardForm onAdd={onAdd} canAdd={canAdd} onBlocked={onAddBlocked} />
    </section>
  );
}
