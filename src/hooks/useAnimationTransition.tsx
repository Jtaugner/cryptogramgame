import { useEffect, useState, useRef } from "react";

export function useAnimationTransition(
  visible: boolean,
  duration = 300,
  disableAnimation = false
) {
  const [mounted, setMounted] = useState(visible);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Если анимацию отключили — моментальные переходы
    if (disableAnimation) {
      setMounted(visible);
      return;
    }

    if (visible) {
      setMounted(true);
    } else {
      timeoutRef.current = window.setTimeout(() => setMounted(false), duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, duration, disableAnimation]);

  console.log('mounted', mounted);
  return mounted;
}
