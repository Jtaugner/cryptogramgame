import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type Options = {
  minFontSize?: number;
  step?: number;
  minGapPx?: number;
  blockSelector?: string;
};

export function useAutoFontSizeWithNearElement<T extends HTMLElement>({
  minFontSize = 6,
  step = 0.5,
  minGapPx = 0.5,
  blockSelector = '.circle',
}: Options = {}) {
  const ref = useRef<T>(null);
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement;
    if (!parent) return;

    const circles = Array.from(parent.querySelectorAll(blockSelector)).filter(
      (n): n is HTMLElement => n instanceof HTMLElement
    );
    if (!circles.length) return;

    const computed = window.getComputedStyle(el);
    const start = Math.floor(parseFloat(computed.fontSize));
    if (!Number.isFinite(start)) return;

    const max = Math.max(start, minFontSize);

    const quant = (v: number) =>
      Math.max(minFontSize, Math.floor(v / step) * step);

    const signedGapX = (a: DOMRect, b: DOMRect) => {
      // b справа от a
      if (b.left >= a.right) return b.left - a.right;
      // b слева от a
      if (a.left >= b.right) return a.left - b.right;
      // пересечение/касание по X (глубина пересечения со знаком "-")
      const overlap = Math.min(a.right - b.left, b.right - a.left);
      return -overlap; // <= 0
    };

    const getNearestGapX = () => {
      const a = el.getBoundingClientRect();

      let best: number | null = null;
      for (const c of circles) {
        if (c === el) continue;
        const b = c.getBoundingClientRect();
        const g = signedGapX(a, b);

        // "ближайший" по горизонтали: минимальный |gap|
        if (best === null || Math.abs(g) < Math.abs(best)) best = g;
      }

      return best ?? Number.POSITIVE_INFINITY;
    };

    // пробуем максимальный размер
    if (getNearestGapX() >= minGapPx) return;
    el.style.fontSize = `${max}px`;

    // бинарный поиск по размеру шрифта
    let lo = minFontSize;
    let hi = max;
    let best = minFontSize;

    while (lo <= hi) {
      const mid = quant((lo + hi) / 2);
      el.style.fontSize = `${mid}px`;

      if (getNearestGapX() >= minGapPx) {
        best = mid;
        lo = mid + step;
      } else {
        hi = mid - step;
      }
    }

    el.style.fontSize = `${best}px`;
  }, [minFontSize, step, minGapPx, blockSelector, i18n.language]);

  return ref;
}
