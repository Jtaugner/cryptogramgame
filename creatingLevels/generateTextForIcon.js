function encodeLetters(text) {
     const map = new Map();   // буква → номер
     const used = new Set();  // уже занятые номера
     const result = [];
   
     function getFreeNumber() {
       // свободные 1–9
       const low = [];
       for (let i = 1; i <= 9; i++) {
         if (!used.has(i)) low.push(i);
       }
   
       if (low.length > 0) {
         const num = low[Math.floor(Math.random() * low.length)];
         used.add(num);
         return num;
       }
   
       // свободные 10–21
       const high = [];
       for (let i = 10; i <= 21; i++) {
         if (!used.has(i)) high.push(i);
       }
   
       const num = high[Math.floor(Math.random() * high.length)];
       used.add(num);
       return num;
     }
   
     for (const ch of text) {
       // берём только буквы из любых алфавитов (Unicode)
       if (!/\p{L}/u.test(ch)) continue;
   
       const letter = ch.toLocaleLowerCase();
   
       if (!map.has(letter)) {
         map.set(letter, getFreeNumber());
       }
   
       result.push(map.get(letter));
     }
   
     return result.join(" ");
   }
   