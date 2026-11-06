'use client';

import { useEffect, useRef } from 'react';

type Handler = (event: KeyboardEvent) => void;

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    target.isContentEditable ||
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT'
  );
}

/**
 * Single-key shortcuts that stay out of the way while the user is typing.
 * Keys are matched against `event.key`; prefix with "mod+" for Ctrl/Cmd.
 */
export function useHotkeys(bindings: Record<string, Handler>, enabled = true) {
  const ref = useRef(bindings);
  ref.current = bindings;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey) return;
      const mod = event.metaKey || event.ctrlKey;
      const id = mod ? `mod+${event.key.toLowerCase()}` : event.key;
      const handler = ref.current[id];
      if (!handler) return;
      if (!mod && isTyping(event.target)) return;
      if (document.querySelector('dialog[open]') && !mod && id !== 'Escape')
        return;
      handler(event);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
