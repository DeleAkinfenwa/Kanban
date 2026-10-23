import { useEffect, useState } from 'react';

// localStorage key for saving the board
const STORAGE_KEY = 'kanban-board:v1';

// unique id for new cards
const uid = () =>
  (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

// friendly field names for the edit history
const FIELD_LABEL = {
  title: 'title',
  description: 'notes',
  priority: 'priority',
  category: 'category',
  deadline: 'deadline',
};

// display names for each column
const COLUMN_TITLES = { todo: 'To Do', doing: 'In Progress', review: 'Review', done: 'Done' };

// sample cards shown on first visit
function seedBoard() {
  const cards = [
    { title: 'Welcome! Thanks for checking out my board!', description: 'Drag cards between columns, or use the arrows on each card.', priority: 'low', category: 'other', column: 'todo' },
    { title: 'Add a card', description: 'Use "+ Add card" at the bottom of any column.', priority: 'medium', category: 'prototyping', column: 'todo' },
    { title: 'Edit me', description: 'Click a card to edit its title, notes, priority, category and deadline. The colored corner shows the category.', priority: 'high', category: 'coding', deadline: Date.now() + (4 * 24 + 7) * 60 * 60 * 1000 + 30 * 60 * 1000, column: 'doing' },
    { title: 'Waiting for review', description: 'Move cards here when the work is finished but needs checking.', priority: 'medium', category: 'coding', column: 'review' },
    {
      title: 'Reach out to me!',
      description:
        "Since you're here seeing this, I'm probably a potential hire for your company. Go ahead and shoot me an email or text! I'm more than happy to have a conversation even if its just a quick 5 min call.\n\n***Any messages coming from my websites 'Contact Me' section are marked as important and send me notifications directly.",
      priority: 'high',
      category: 'admin',
      deadline: Date.now() + 43 * 60 * 1000 + 59 * 1000, // shows "43 minutes" on first load
      column: 'review',
    },
    { title: 'Your changes are saved', description: 'Everything is stored on your browser automatically.', priority: 'low', category: 'admin', column: 'done' },
  ].map(({ placedBy = null, ...c }) => ({
    ...c,
    id: uid(),
    createdAt: Date.now(),
    placedBy,
    history: [
      placedBy
        ? { action: 'created', detail: `in ${COLUMN_TITLES[c.column]}`, ...placedBy, at: Date.now() }
        : { action: 'created', name: 'Sample board', role: null, at: Date.now() },
    ],
  }));

  // empty columns, then drop each card into its column
  const columns = [
    { id: 'todo', title: 'To Do', cardIds: [] },
    { id: 'doing', title: 'In Progress', cardIds: [] },
    { id: 'review', title: 'Review', cardIds: [] },
    { id: 'done', title: 'Done', cardIds: [] },
  ];
  const byId = {};
  for (const { column, ...card } of cards) {
    byId[card.id] = card;
    columns.find((col) => col.id === column).cardIds.push(card.id);
  }
  return { columns, cards: byId };
}

// give old cards a "created" history entry
function withCreatedEntry(card) {
  const history = card.history ?? [];
  if (history.some((e) => e.action === 'created')) return history;
  const at = card.createdAt ?? history[0]?.at ?? Date.now();
  return [{ action: 'created', name: 'Unknown', role: null, at, detail: '(before history was tracked)' }, ...history];
}

// bring boards saved by older versions up to date
function migrate(board) {
  let { columns, cards } = board;
  if (!columns.some((c) => c.id === 'review')) {
    const doneIndex = columns.findIndex((c) => c.id === 'done');
    const at = doneIndex === -1 ? columns.length : doneIndex;
    columns = [...columns.slice(0, at), { id: 'review', title: 'Review', cardIds: [] }, ...columns.slice(at)];
  }
  // old "review" category becomes other, and missing history gets filled in
  cards = Object.fromEntries(
    Object.entries(cards).map(([id, card]) => [
      id,
      {
        ...card,
        category: card.category === 'review' ? 'other' : card.category,
        history: withCreatedEntry(card),
        placedBy: card.placedBy ?? null,
      },
    ])
  );
  return { columns, cards };
}

// load the saved board or fall back to the sample
function loadBoard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.columns) && parsed?.cards) return migrate(parsed);
    }
  } catch {
    // storage blocked or corrupt: start fresh
  }
  return seedBoard();
}

// main board hook with all card actions
export function useBoard() {
  // board state, loaded once on start
  const [board, setBoard] = useState(loadBoard);

  // save the board to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch {
      // storage unavailable (private mode): board still works for this visit
    }
  }, [board]);

  // add a new card to a column, recording who made it
  const addCard = (columnId, fields, actor) =>
    setBoard((b) => {
      const at = Date.now();
      const columnTitle = b.columns.find((c) => c.id === columnId)?.title;
      const card = {
        id: uid(),
        createdAt: at,
        description: '',
        priority: 'medium',
        category: 'other',
        deadline: null,
        ...fields,
        placedBy: actor,
        history: [{ action: 'created', detail: `in ${columnTitle}`, ...actor, at }],
      };
      return {
        cards: { ...b.cards, [card.id]: card },
        columns: b.columns.map((col) =>
          col.id === columnId ? { ...col, cardIds: [...col.cardIds, card.id] } : col
        ),
      };
    });

  // edit a card and log which fields changed
  const updateCard = (id, fields, actor) =>
    setBoard((b) => {
      const card = b.cards[id];
      const changed = Object.keys(fields).filter((k) => (fields[k] ?? null) !== (card[k] ?? null));
      if (changed.length === 0) return b;
      const names = changed.map((k) => FIELD_LABEL[k] ?? k).join(', ');
      return {
        ...b,
        cards: {
          ...b.cards,
          [id]: {
            ...card,
            ...fields,
            history: [...(card.history ?? []), { action: 'edited', detail: names, ...actor, at: Date.now() }],
          },
        },
      };
    });

  // remove a card from the board
  const deleteCard = (id) =>
    setBoard((b) => {
      const { [id]: _removed, ...cards } = b.cards;
      return {
        cards,
        columns: b.columns.map((col) => ({ ...col, cardIds: col.cardIds.filter((c) => c !== id) })),
      };
    });

  // move a card to a column and position (index counted before removal)
  const moveCard = (id, toColumnId, toIndex, actor) =>
    setBoard((b) => {
      const from = b.columns.find((col) => col.cardIds.includes(id));
      if (!from) return b;
      let index = toIndex ?? Infinity;
      if (from.id === toColumnId) {
        const current = from.cardIds.indexOf(id);
        if (index > current) index -= 1;
        if (index === current) return b;
      }
      // moving columns records who put it there; reordering doesn't
      let cards = b.cards;
      if (from.id !== toColumnId && actor) {
        const card = b.cards[id];
        const to = b.columns.find((c) => c.id === toColumnId);
        cards = {
          ...b.cards,
          [id]: {
            ...card,
            placedBy: actor,
            history: [
              ...(card.history ?? []),
              { action: 'moved', detail: `from ${from.title} to ${to.title}`, ...actor, at: Date.now() },
            ],
          },
        };
      }
      // take the card out of its old spot and insert it at the new index
      return {
        cards,
        columns: b.columns.map((col) => {
          let ids = col.cardIds.filter((c) => c !== id);
          if (col.id === toColumnId) {
            ids = [...ids];
            ids.splice(Math.min(index, ids.length), 0, id);
          }
          return ids === col.cardIds ? col : { ...col, cardIds: ids };
        }),
      };
    });

  // delete every card in one column
  const clearColumn = (columnId) =>
    setBoard((b) => {
      const col = b.columns.find((c) => c.id === columnId);
      const cards = { ...b.cards };
      col.cardIds.forEach((id) => delete cards[id]);
      return {
        cards,
        columns: b.columns.map((c) => (c.id === columnId ? { ...c, cardIds: [] } : c)),
      };
    });

  // go back to the sample board
  const resetBoard = () => setBoard(seedBoard());

  // actions exposed to the app
  return { board, addCard, updateCard, deleteCard, moveCard, clearColumn, resetBoard };
}
