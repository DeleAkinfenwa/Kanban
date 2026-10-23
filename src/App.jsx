import { useState } from 'react';
import ThemeToggle from './ThemeToggle.jsx';
import Sky from './Sky.jsx';
import AlertsToggle from './AlertsToggle.jsx';
import Toasts from './Toasts.jsx';
import { useDeadlineAlerts } from './alerts.js';
import CategoryEditor from './CategoryEditor.jsx';
import NamePrompt from './NamePrompt.jsx';
import { useNow } from './deadline.js';
import { useBoard } from './useBoard.js';
import { useIdentity, ROLE_LABEL } from './identity.js';
import Column from './Column.jsx';
import CardModal from './CardModal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import AdminNotice from './AdminNotice.jsx';
import { CategoriesContext, useCategoryState, catProps } from './categories.js';

// main board page
export default function App() {
  // board data and actions
  const { board, addCard, updateCard, deleteCard, moveCard, clearColumn, resetBoard } = useBoard();
  // current user name and role
  const { identity, isAdmin, setName, toggleRole } = useIdentity();
  // category list and saving
  const { categories, saveCategories, resetCategories } = useCategoryState();
  // which modal or card is open
  const [editingCategories, setEditingCategories] = useState(false);
  const [adminNotice, setAdminNotice] = useState(null);
  const [openId, setOpenId] = useState(null);
  // search text and drag tracking
  const [query, setQuery] = useState('');
  const [dragId, setDragId] = useState(null);
  // clock, confirm dialog and deadline alerts
  const now = useNow();
  const [pendingConfirm, setPendingConfirm] = useState(null);
  const alerts = useDeadlineAlerts({ board, now, onOpenCard: setOpenId });
  // role button highlight and confirm dialog helper
  const [highlightRole, setHighlightRole] = useState(false);
  const askConfirm = (message, confirmLabel, action) => setPendingConfirm({ message, confirmLabel, action });

  // ask for a name the first time, then run the pending action
  const [pendingAction, setPendingAction] = useState(null);
  const withActor = (action) => {
    if (identity.name) action({ name: identity.name, role: identity.role });
    else setPendingAction(() => action);
  };

  // search filter for cards
  const q = query.trim().toLowerCase();
  const matches = (card) =>
    !q || card.title.toLowerCase().includes(q) || card.description.toLowerCase().includes(q);

  // done count and column lookup
  const total = Object.keys(board.cards).length;
  const done = board.columns.find((c) => c.id === 'done')?.cardIds.length ?? 0;
  const columnOf = (id) => board.columns.find((c) => c.cardIds.includes(id))?.id;

  // share categories with every component
  return (
    <CategoriesContext.Provider value={categories}>
    <div className="app">
      {/* day/night sky background */}
      <Sky />
      {/* header with title and toolbar */}
      <header className="topbar">
        {/* title and done count */}
        <div className="brand">
          <h1>Dele's Kanban Board</h1>
          <span className="meta">
            {done}/{total} done
          </span>
        </div>

        {/* toolbar buttons and search */}
        <div className="toolbar">
          {/* categories dropdown with color legend */}
          <div className="legend-menu">
            <button type="button" className="btn ghost legend-trigger" aria-haspopup="true">
              <span className="legend-dots" aria-hidden="true">
                {categories.map((c) => {
                  const { className, style } = catProps(c);
                  return <span key={c.id} className={`dot ${className}`} style={style} />;
                })}
              </span>
              Categories
            </button>
            {/* category list, plus edit button */}
            <ul className="legend" aria-label="Category colors">
              {categories.map((c) => (
                <li key={c.id} {...catProps(c)}>
                  <span className="swatch" />
                  {c.label}
                </li>
              ))}
              <li className="legend-action">
                <button
                  type="button"
                  className="btn ghost small"
                  onClick={() => (isAdmin ? setEditingCategories(true) : setAdminNotice('categories'))}
                >
                  Edit categories
                </button>
              </li>
            </ul>
          </div>
          {/* theme and deadline alert toggles */}
          <ThemeToggle />
          <AlertsToggle enabled={alerts.enabled} permission={alerts.permission} onToggle={alerts.toggle} />
          {/* card search box */}
          <input
            className="search"
            type="search"
            placeholder="Search cards…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search cards"
          />
          {/* current user badge */}
          {identity.name && (
            <span className={`whoami role-${identity.role}`} title="Name for this session">
              {ROLE_LABEL[identity.role]}: {identity.name}
            </span>
          )}
          {/* switch between user and admin */}
          <button
            type="button"
            className={`btn ghost${highlightRole ? ' attention' : ''}`}
            onClick={() => {
              setHighlightRole(false);
              toggleRole();
            }}
            onAnimationEnd={() => setHighlightRole(false)}
          >
            {isAdmin ? 'Become User' : 'Become Admin'}
          </button>
          {/* admin-only board reset */}
          {isAdmin && (
            <button
              className="btn ghost"
              onClick={() =>
                askConfirm('Reset the board to the sample cards? This removes all your cards.', 'Reset board', resetBoard)
              }
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* board columns */}
      <main className="board">
        {board.columns.map((column, colIndex) => (
          <Column
            key={column.id}
            column={column}
            now={now}
            cards={column.cardIds.map((id) => board.cards[id]).filter(Boolean)}
            matches={matches}
            filtering={Boolean(q)}
            dragId={dragId}
            setDragId={setDragId}
            onAdd={(fields) => withActor((actor) => addCard(column.id, fields, actor))}
            canAdd={isAdmin}
            onAddBlocked={() => setAdminNotice('cards')}
            onOpen={setOpenId}
            onMove={(id, toColumnId, toIndex) => {
              // reordering inside a column needs no name; changing column does
              if (columnOf(id) === toColumnId) moveCard(id, toColumnId, toIndex);
              else withActor((actor) => moveCard(id, toColumnId, toIndex, actor));
            }}
            canClear={isAdmin}
            onClear={() =>
              askConfirm(
                `Delete all ${column.cardIds.length} cards in ${column.title}?`,
                'Delete cards',
                () => clearColumn(column.id)
              )
            }
            prevColumnId={board.columns[colIndex - 1]?.id}
            nextColumnId={board.columns[colIndex + 1]?.id}
          />
        ))}
      </main>

      {/* card edit modal */}
      {openId && board.cards[openId] && (
        <CardModal
          key={openId}
          card={board.cards[openId]}
          columns={board.columns}
          columnId={columnOf(openId)}
          readOnly={!isAdmin}
          onSave={(fields, columnId) => {
            const id = openId;
            setOpenId(null);
            withActor((actor) => {
              updateCard(id, fields, actor);
              if (columnId !== columnOf(id)) moveCard(id, columnId, undefined, actor);
            });
          }}
          onDelete={() => {
            deleteCard(openId);
            setOpenId(null);
          }}
          onClose={() => setOpenId(null)}
        />
      )}

      {/* deadline alert popups */}
      <Toasts toasts={alerts.toasts} onOpen={setOpenId} onDismiss={alerts.dismiss} />

      {/* name prompt before the first change */}
      {pendingAction && (
        <NamePrompt
          role={ROLE_LABEL[identity.role]}
          onSubmit={(name) => {
            setName(name);
            pendingAction({ name, role: identity.role });
            setPendingAction(null);
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {/* notice when a user tries an admin action */}
      {adminNotice && (
        <AdminNotice
          what={adminNotice === 'categories' ? 'edit categories' : 'create cards'}
          onClose={() => {
            setAdminNotice(null);
            setHighlightRole(true);
          }}
        />
      )}

      {/* category color editor */}
      {editingCategories && (
        <CategoryEditor
          categories={categories}
          onSave={(edits) => {
            saveCategories(edits);
            setEditingCategories(false);
          }}
          onReset={() => {
            resetCategories();
            setEditingCategories(false);
          }}
          onClose={() => setEditingCategories(false)}
        />
      )}

      {/* confirm dialog for delete and reset */}
      {pendingConfirm && (
        <ConfirmDialog
          message={pendingConfirm.message}
          confirmLabel={pendingConfirm.confirmLabel}
          onConfirm={() => {
            pendingConfirm.action();
            setPendingConfirm(null);
          }}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
    </CategoriesContext.Provider>
  );
}
