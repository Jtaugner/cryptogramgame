import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export function useAutoFontSizeByHeight<T extends HTMLElement>({
  minFontSize = 6,
  step = 0.5,
} = {}) {
  const ref = useRef<T>(null);
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const computed = window.getComputedStyle(el);
    const start = Math.floor(parseFloat(computed.fontSize));
    if (!Number.isFinite(start)) return;

    const max = Math.max(minFontSize, start);
    const targetH = el.clientHeight;

    const quant = (v: number) =>
      Math.max(minFontSize, Math.floor(v / step) * step);

    if (el.scrollHeight <= targetH) return;
    el.style.fontSize = `${max}px`;

    let lo = minFontSize;
    let hi = max;
    let best = minFontSize;

    while (lo <= hi) {
      const mid = quant((lo + hi) / 2);
      el.style.fontSize = `${mid}px`;

      if (el.scrollHeight <= targetH) {
        best = mid;
        lo = mid + step;
      } else {
        hi = mid - step;
      }
    }

    el.style.fontSize = `${best}px`;
  }, [minFontSize, step, i18n.language]); // 👈 ключевая строка

  return ref;
}
