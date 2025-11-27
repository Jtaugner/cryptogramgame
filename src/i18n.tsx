// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translations from './locales/translation.json';
import locations from './locales/locations.json';

const resources: any = {
   en: { translation: {} },
   ru: { translation: {} },
   fr: { translation: {} },
   es: { translation: {} },
   it: { translation: {} },
   de: { translation: {} }
};

const allTranslations = { ...translations, ...locations };

for (const key in allTranslations) {
  const entry = allTranslations[key];
  for (const lang in entry) {
    resources[lang].translation[key] = entry[lang];
  }
}
i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export const changeLanguage = (language: string) => {
   i18n.changeLanguage(language);
}

/*
let all = {}
console.log(Object.keys(ru).length)
console.log(Object.keys(en).length)
let keys = Object.keys(ru);
let keysEN = Object.keys(en);
keys.forEach(k => {
    if(!keysEN.includes(k)) console.log(k)
    all[k] = {
        "ru": ru[k],
        "en": en[k]
    }
})
console.log(all);
localStorage.setItem("dasfvx", JSON.stringify(all))
*/

export default i18n;
