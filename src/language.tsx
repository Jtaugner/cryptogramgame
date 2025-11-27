function detectUserLanguage() {
     // 1. Основной источник
     if (navigator.languages && navigator.languages.length > 0) {
       return navigator.languages[0]; // например "ru-RU"
     }
   
     // 2. Запасные варианты
     if (navigator.language) return navigator.language;
     if (navigator.userLanguage) return navigator.userLanguage; // старый IE
     if (navigator.browserLanguage) return navigator.browserLanguage;
     if (navigator.systemLanguage) return navigator.systemLanguage;
   
     return 'en'; // fallback
}

export function getLang() {
  return detectUserLanguage().split('-')[0].toLowerCase();
}

const langGroups = {
     ru: ['ru', 'be', 'kk', 'uk', 'uz', 'kz'],
     en: ['en', 'au', 'gb', 'us', 'ca', 'nz', 'ie'],
     fr: ['fr', 'be', 'ca', 'ch', 'lu', 'mc'],
     es: ['es', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'uy', 'ec', 'bo', 'py', 'cr', 'sv', 'hn', 'ni', 'gt', 'pa', 'do'],
     it: ['it', 'ch', 'sm', 'va'],
     de: ['de', 'at', 'ch', 'lu', 'li']
};
   

export function detectAppLanguage(lang: string) {
     for (const appLang in langGroups) {
       if (langGroups[appLang as keyof typeof langGroups].includes(lang)) {
         return appLang;
       }
     }
     return 'en'; // fallback
}