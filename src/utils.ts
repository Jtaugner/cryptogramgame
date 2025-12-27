export function scrollIntoViewY(container: any, element: any, options: any = {}) {
     try {
       const { behavior = 'auto', align = 'start' } = options;
   
       const elTop = element.offsetTop - container.offsetTop;
       let top = container.scrollTop;
   
       switch (align) {
         case 'center':
           top = elTop - (container.clientHeight / 2 - element.clientHeight / 2);
           break;
         case 'end':
           top = elTop - (container.clientHeight - element.clientHeight);
           break;
         case 'nearest':
           if (elTop < container.scrollTop) {
             top = elTop; // элемент выше видимой области
           } else if (elTop + element.clientHeight > container.scrollTop + container.clientHeight) {
             top = elTop - (container.clientHeight - element.clientHeight); // элемент ниже
           }
           break;
         case 'start':
         default:
           top = elTop;
       }
       console.log('scrollIntoViewY', top);
   
       container.scrollTo({ top, behavior });
     } catch (e) {
   
     }
   
}