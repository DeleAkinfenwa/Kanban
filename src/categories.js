import { createContext, useContext, useEffect, useState } from 'react';

// built-in categories; defaultColor is the light-mode color shown in the picker
const DEFAULTS = [
  { id: 'coding', label: 'Coding', defaultColor: '#2563eb' },
  { id: 'maintenance', label: 'Maintenance', defaultColor: '#ea580c' },
  { id: 'prototyping', label: 'Prototyping', defaultColor: '#0d9488' },
  { id: 'admin', label: 'Admin', defaultColor: '#db2777' },
  { id: 'other', label: 'Other', defaultColor: '#eab308' },
];

// custom names and colors are saved per browser as { [id]: { label, color } }
const STORAGE_KEY = 'kanban-board:categories';

// load saved custom names and colors
function loadOverrides() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === 'object') return saved;
  } catch {
    // storage unavailable: use the defaults
  }
  return {};
}

// combine defaults with custom names and colors
const merge = (overrides) =>
  DEFAULTS.map((d) => {
    const o = overrides[d.id] ?? {};
    const color = o.color && o.color.toLowerCase() !== d.defaultColor ? o.color : null;
    return { id: d.id, label: o.label?.trim() || d.label, defaultLabel: d.label, defaultColor: d.defaultColor, color };
  });

// hook that holds category edits and saves them
export function useCategoryState() {
  const [overrides, setOverrides] = useState(loadOverrides);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch {
      // storage unavailable: changes last until reload
    }
  }, [overrides]);

  return {
    categories: merge(overrides),
    // edits: [{ id, label, color }]
    saveCategories: (edits) =>
      setOverrides(Object.fromEntries(edits.map((e) => [e.id, { label: e.label, color: e.color }]))),
    resetCategories: () => setOverrides({}),
  };
}

// share the current categories with every component
export const CategoriesContext = createContext(merge({}));
export const useCategories = () => useContext(CategoriesContext);

// find a card's category, falling back to the last one
export const categoryOf = (card, categories) =>
  categories.find((c) => c.id === card.category) ?? categories[categories.length - 1];

// class and style that set the --cat color for a category
export const catProps = (cat) => ({
  className: `cat-${cat.id}`,
  style: cat.color ? { '--cat': cat.color } : undefined,
});
