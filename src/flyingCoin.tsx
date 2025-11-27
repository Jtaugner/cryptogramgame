export function getFlyingCoin() {
          const source = document.querySelector('.menu-daily-broccoli');
          const target = document.querySelector('.moneyCount .modal-shop-row-price-icon');
        
          if (!source || !target) return;
        
          const s = source.getBoundingClientRect();
          const t = target.getBoundingClientRect();
        
          // создаём новый летящий элемент
          const flyIcon = document.createElement('div');
          flyIcon.className = 'modal-shop-row-price-icon fly-icon';
          document.body.appendChild(flyIcon);
        
          // стартовые координаты — центр source
          const startX = s.left + s.width / 2;
          const startY = s.top + s.height / 2;
        
          // конечная точка — ЛЕВЫЙ ВЕРХ target (без центра)
          const endX = t.left;
          const endY = t.top;
        
          // ставим на стартовую позицию
          flyIcon.style.position = 'fixed';
          flyIcon.style.left = startX + 'px';
          flyIcon.style.top = startY + 'px';
          flyIcon.style.opacity = '1';
          flyIcon.style.transform = 'translate(0, 0) scale(0.8)';
        
          // запускаем движение
          requestAnimationFrame(() => {
            flyIcon.style.transform = `translate(${endX - startX}px, ${endY - startY}px) scale(0.8)`;
          });
        
          // по завершении движения — мгновенно скрыть
          flyIcon.addEventListener('transitionend', () => {
            flyIcon.style.opacity = '0';
            flyIcon.remove();
          });
}
        