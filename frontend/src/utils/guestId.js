const GUEST_ID_KEY = 'guestId';

const generateGuestId = () => {
  if (typeof window === 'undefined') return null;
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
};

export const ensureGuestId = () => {
  if (typeof window === 'undefined') return null;
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = generateGuestId();
    if (guestId) {
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
  }
  return guestId;
};

export const getGuestId = () => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(GUEST_ID_KEY);
  return stored || ensureGuestId();
};

