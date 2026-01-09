import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside an element
 * @param {Function} handler - Callback function to execute on outside click
 * @returns {React.RefObject} Ref to attach to the element
 */
export const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handler]);

  return ref;
};
