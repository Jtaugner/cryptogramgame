import { useLayoutEffect, useState } from 'react';

export function useHasScroll(ref: React.RefObject<HTMLElement>) {
  const [hasScroll, setHasScroll] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setHasScroll(el.scrollHeight > el.clientHeight);
    };

    check();

    const ro = new ResizeObserver(check);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return hasScroll;
}
