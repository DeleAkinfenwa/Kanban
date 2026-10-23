import { useEffect, useState } from 'react';

// who is using the board this session, kept until the tab closes
const STORAGE_KEY = 'kanban-board:identity';
const EMPTY = { name: '', role: 'user' };

// load the saved identity for this tab
function load() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.name === 'string') return { ...EMPTY, ...saved };
  } catch {
    // storage unavailable: start as an anonymous user
  }
  return EMPTY;
}

// display names for roles
export const ROLE_LABEL = { admin: 'Admin', user: 'User' };

// hook for the current user's name and admin/user role
export function useIdentity() {
  const [identity, setIdentity] = useState(load);

  // save identity whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    } catch {
      // storage unavailable: identity lasts until reload
    }
  }, [identity]);

  // identity plus helpers to rename and switch roles
  return {
    identity,
    isAdmin: identity.role === 'admin',
    setName: (name) => setIdentity((i) => ({ ...i, name })),
    toggleRole: () => setIdentity((i) => ({ ...i, role: i.role === 'admin' ? 'user' : 'admin' })),
  };
}
