import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

type Options = {
  /** Минимальный размер шрифта, ниже которого не опускаемся */
  minFontSize?: number;
  /** Шаг уменьшения (в px) */
  step?: number;
  /** Допуск расхождения ширин (в px) */
  widthEps?: number;
  /** Проверять, что текст не переполняет кнопку по ширине */
  alsoCheckOverflow?: boolean;
  /** Внешние зависимости, при смене которых пересчитывать (язык, раскладка и т.п.) */
  deps?: unknown[];
};

export function useUniformKeyboardKeyFont<T extends HTMLElement>({
  minFontSize = 10,
  step = 0.5,
  widthEps = 0.5,
  alsoCheckOverflow = true,
  deps = [],
}: Options = {}) {
  const ref = useRef<T>(null);
  const { i18n } = useTranslation();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const rows = Array.from(root.querySelectorAll<HTMLElement>('.keyboard-row'));
    if (!rows.length) return;

    // Снимем “базовый” font-size с первой найденной клавиши
    const firstKey = root.querySelector<HTMLElement>('.keyboard-key');
    if (!firstKey) return;

    const base = parseFloat(getComputedStyle(firstKey).fontSize);
    if (!Number.isFinite(base)) return;

    // Сбросим всем клавишам инлайн-стили, чтобы начать от CSS-базы
    const allKeys = Array.from(root.querySelectorAll<HTMLElement>('.keyboard-key'));
    for (const k of allKeys) k.style.fontSize = '';

    // После сброса ещё раз возьмём актуальную базу (если CSS переопределил)
    const base2 = parseFloat(getComputedStyle(firstKey).fontSize);
    const start = Number.isFinite(base2) ? base2 : base;

    const widthsOkInRow = (keys: HTMLElement[]) => {
      if (keys.length <= 1) return true;
      const widths = keys.map(k => k.getBoundingClientRect().width);
      const minW = Math.min(...widths);
      const maxW = Math.max(...widths);
      if (maxW - minW > widthEps) return false;

      if (alsoCheckOverflow) {
        // Если хоть одна клавиша переполняется по ширине — считаем “не ок”
        for (const k of keys) {
          // маленький допуск на субпиксели
          if (k.scrollWidth - k.clientWidth > 1) return false;
        }
      }
      return true;
    };

    const allRowsOk = () => {
      for (const row of rows) {
        const keys = Array.from(row.querySelectorAll<HTMLElement>('.keyboard-key'));
        if (!widthsOkInRow(keys)) return false;
      }
      return true;
    };

    // Пытаемся подобрать размер шрифта вниз
    let size = start;

    // Страховка от бесконечного цикла
    for (let guard = 0; guard < 200; guard++) {
      // Применяем текущий размер всем клавишам (одинаково)
      for (const k of allKeys) k.style.fontSize = `${size}px`;

      if (allRowsOk()) break;

      const next = Math.max(minFontSize, Math.floor((size - step) / step) * step);
      if (next >= size || next <= minFontSize) {
        // дошли до минимума или шаг “не двигает”
        size = next;
        for (const k of allKeys) k.style.fontSize = `${size}px`;
        break;
      }
      size = next;
    }

    // Реакция на ресайз/изменение размеров контейнера
    const ro = new ResizeObserver(() => {
      // перезапускаем эффект через “перепривязку” — просто форсим рефлоу и повторим логику
      // проще всего: триггернуть layout-effect повторно невозможно напрямую,
      // поэтому делаем лёгкий хак: вызываем ту же логику через requestAnimationFrame
      requestAnimationFrame(() => {
        // Сброс и повтор (минимально дублируем)
        for (const k of allKeys) k.style.fontSize = '';
        const base3 = parseFloat(getComputedStyle(firstKey).fontSize);
        let s = Number.isFinite(base3) ? base3 : start;

        for (let guard = 0; guard < 200; guard++) {
          for (const k of allKeys) k.style.fontSize = `${s}px`;
          if (allRowsOk()) break;
          const next = Math.max(minFontSize, Math.floor((s - step) / step) * step);
          if (next >= s || next <= minFontSize) {
            s = next;
            for (const k of allKeys) k.style.fontSize = `${s}px`;
            break;
          }
          s = next;
        }
      });
    });

    ro.observe(root);

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, i18n.language]);

  return ref;
}
