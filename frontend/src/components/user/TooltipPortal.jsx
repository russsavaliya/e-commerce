import React, { useState, useRef, useEffect, cloneElement } from 'react';
import { createPortal } from 'react-dom';

const TooltipPortal = ({ content, children, offset = 8 }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const show = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.bottom + offset + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => show();
    const onResize = () => show();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [visible]);

  // Clone child to attach handlers and ref
  const child = React.Children.only(children);
  const cloned = cloneElement(child, {
    ref: (node) => {
      triggerRef.current = node;
      const { ref } = child;
      if (typeof ref === 'function') ref(node);
      else if (ref && typeof ref === 'object') ref.current = node;
    },
    onMouseEnter: (e) => {
      show();
      if (child.props.onMouseEnter) child.props.onMouseEnter(e);
    },
    onMouseLeave: (e) => {
      hide();
      if (child.props.onMouseLeave) child.props.onMouseLeave(e);
    },
    onFocus: (e) => {
      show();
      if (child.props.onFocus) child.props.onFocus(e);
    },
    onBlur: (e) => {
      hide();
      if (child.props.onBlur) child.props.onBlur(e);
    },
  });

  return (
    <>
      {cloned}
      {visible && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="tooltip"
              style={{
                position: 'absolute',
                top: coords.top,
                left: coords.left,
                transform: 'translateX(-50%)',
                zIndex: 99999,
                pointerEvents: 'none',
              }}
            >
              <div className="mt-2 px-3 py-1.5 bg-[rgba(72,29,111,0.1)] text-[rgb(72,29,111)] text-xs font-medium rounded-md transition-opacity duration-150 pointer-events-none whitespace-nowrap border border-[rgba(72,29,111,0.2)]">
                {content}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1">
                  <div className="w-2 h-2 bg-[rgba(72,29,111,0.1)] border-l border-b border-[rgba(72,29,111,0.2)] rotate-45"></div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};

export default TooltipPortal;
