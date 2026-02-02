function isIOS() {
     return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+
}
   
export function prohibitSwipeToRefresh(id: string) {
     if (!isIOS()) return; // <-- работаем только на iOS
   
     const scroller = document.querySelector<HTMLElement>(id);
     if (!scroller) return;
   
     let startY = 0;
   
     scroller.addEventListener(
       'touchstart',
       e => {
         startY = e.touches[0].clientY;
       },
       { passive: true }
     );
   
     scroller.addEventListener(
       'touchmove',
       e => {
         const y = e.touches[0].clientY;
         const dy = y - startY;
   
         const atTop = scroller.scrollTop <= 0;
         const atBottom =
           scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
   
         const pullingDown = dy > 0;
         const pullingUp = dy < 0;
   
         // Блокируем жест, если пытаются "выйти" за пределы скроллера
         if ((pullingDown && atTop) || (pullingUp && atBottom)) {
           e.preventDefault();
         }
       },
       { passive: false }
     );
   }
   