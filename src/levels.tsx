export interface LevelData {
     text: string
     hiddenIndexes: number[]
     name: string
     desc?: string
     type: string
}
export const typesOfCategories = ['quotes', 'poems', 'aphorisms', 'music', 'cinema', 'science'];


export const namesDescs = {
  'Марк Твен': "Американский писатель, журналист, 1835-1910",
  'Станислав Ежи Лец': "Польский поэт, сатирик, 1909-1966",
  'Аристотель': "Древнегреческий мыслитель, ученик Платона, 384–323 до н. э",
  'Валерий Меладзе': "Российский певец и продюсер, 1965",
  'Омар Хайям': "Персидский и таджикский философ, 1048–1131",
  'Конфуций': "Мыслитель и философ Китая, 551-479 до н. э",
  'Ария': "Российская хеви-метал-группа, 1985",
  'Евгений Онегин': "Роман Александра Сергеевича Пушкина",
  'Алла Пугачева': "Советская и российская эстрадная певица, 1949",
  'Сверхъестественное': 'Сериал, 2005-2020',
  'Альберт Эйнштейн': 'Немецкий физик, 1879-1955',
  'Марина Цветаева': 'Русская поэтесса, 1892-1941',
  'Владимир Высоцкий': 'Советский поэт, 1938-1980',
  'Кино': 'Cоветская рок-группа',
  'Теория большого взрыва': 'Сериал, 2007-2019',
  'Уильям Шекспир': 'Английский поэт, драматург, 1564-1616',
  'Уинстон Черчилль': 'Британский государственный деятель, 1874-1965',
  'Друзья': 'Сериал, 1994-2004',
  'Иван Васильевич меняет профессию': 'Фильм, СССР, 1973',
  'Чарли Чаплин': 'Английский киноактёр, кинорежиссёр, 1889-1977',
  'Шерлок': 'Великобритания, сериал, 2010',
  'Сергей Лазарев': 'Российский певец, 1983',
  'Александр Сергеевич Пушкин': 'Российский поэт, 1799-1837',
  'Доктор Хаус': 'Американский телесериал, 2004-2012',
  'Лев Николаевич Толстой': 'Русский писатель, публицист, 1828-1910',
  'Оскар Уайльд': 'Английский писатель, поэт и драматург, 1854-1900',
  'Григорий Лепс': 'Советский и российский певец, 1962',
  'Джентльмены удачи': 'Фильм, СССР, 1971',
  'Москва слезам не верит': 'Фильм, СССР, 1979',
  'Виктор Гюго': 'Французский писатель, 1802-1885',
  'Антон Павлович Чехов': 'Российский писатель, драматург, 1860-1904',
  'Гиппократ': 'Древнегреческий врач и философ, 460-370 до н. э',
  'Бригада': 'Российский телесериал, 2002',
  'Кухня': 'Российский телесериал, 2012',
  'Титаник': 'Американский фильм, 1997',
  'Ирония судьбы, или С лёгким паром!': 'Российский фильм, 1975',
  'Proverb': "",
'Idioms': "",
'Historical fact': "",
'Interesting fact': "",
'Fact about space': "",
'Interesting Fact': "",
'Ralph Waldo Emerson': "American poet, philosopher, and essayist",
'Scientific fact': "",
'Mark Twain': "American writer, humorist",
'Animal fact': "",
'Fact about food': "",
'idioms': "",
'George Bernard Shaw': "Irish playwright, critic, and essayist",
'Fact about sports': "",
'Oscar Wilde': "Irish writer and poet",
'Fact about the world': "",
'Thomas Jefferson': "Third President of the United States",
'Charles Dickens': "English writer and social critic",
'Fact about arts': "",
'Fact about jobs': "",
'Joke': "",
'William Shakespeare': "English playwright, poet, and actor",
'Albert Schweitzer': "German-French organist and physician",
'Russian proverb': "",
'Elvis Presley': "American singer, musician, and actor",
'Fact about politics': "",
'Forrest Gump': "",
'Robert Frost': "American poet",
'Johann Wolfgang von Goethe': "German poet, novelist, and playwright",
'Steve Jobs': "American businessman, inventor, and investor",
'Life hack': "",
'Fact about flora': "",
'Henry David Thoreau': "American transcendentalist writer, philosopher",
'Nelson Mandela': "South African activist and politician",
'R. Kelly': "American singer and record producer",
'The Godfather Part II': "Film, 1974",
'A. A. Milne': "English poet, novelist",
'The Beatles': "English rock band",
'The Wizard of Oz': "",
'Henry Wadsworth Longfellow': "American poet, novelist",
'Who Framed Roger Rabbit': "Film, 1988",
'Gustave Flaubert': "French novelist",
'Fact about economics': "",
'Wolfgang Amadeus Mozart': "Composer of the Classical period",
'On the Waterfront': "Film, 1954",
'George Herbert': "English poet, clergyman, and hymnwriter",
'Justin Bieber': "Canadian singer, songwriter, and actor",
'Notting Hill': "Film, 1999",
'R. Buckminster Fuller': "American architect, designer, and author",
'Knute Rockne': "American football coach",
'Stanley Coren': "Canadian psychologist and author",
'English lullaby': "English lullaby",
'Lullaby': "Lullaby",
'Julius Caesar': "Roman politician and general",
'Taxi Driver': "Film, 1976",
'Benjamin Franklin': "American statesman, inventor, and scientist",
'Wall Street': "Film, 1987",
'Beau Taplin': "American actor",
'The Stand': "Film, 1994",
'Anais Nin': "French-American author, poet, and diarist",
'The History of Mr. Polly': "Novel, 1910",
'Breaking Bad': "Film, 2008",
'George Burns': "American actor, comedian, and singer",
'Life Hack': "",
'Emile Zola': "French novelist and journalist",
'Wonder Woman ': "Film, 2017",
'Shania Twain': "Canadian singer, songwriter, and actress",
'Leon Trotsky': "Russian revolutionary",
'George Orwell': "English novelist and critic",
'Thich Nhat Hanh': "Vietnamese Buddhist monk",
'Walter Winchell': "American radio personality",
'The Notebook': "Film, 2004",
'Agnes Repplier': "American writer and critic",
'Jean Cocteau': "French poet and filmmaker",
'Dead Poets Society': "Film, 1989",
'Walt Whitman': "American poet, journalist, and editor",
'German law': "German law",
'Plato': "Greek philosopher",
'Henry Ford': "American businessman",
'Nicolaus Copernicus': "Polish astronomer, mathematician",
'Harry Potter': "Film, 2001",
'African proverb': "African proverb",
'Lucy Maud Montgomery': "Canadian author",
'Lily Leung': "Hong Kong actress",
'To Kill a Mockingbird': "Film, 1962",
'Mexican proverb': "",
'Dr. John Bradshaw': "English author and broadcaster",
'Immanuel Kant': "German philosopher",
'Popular myth': "Popular myth",
'Benjamin Mays': "American educator",
'J.K. Rowling': "British author",
'Theodore Roosevelt': "26th President of the United States",
'Stirling Moss': "British racing driver",
'Joel Osteen': "American televangelist",
'Confucius': "Chinese philosopher",
'Martin Luther King Jr.': "American civil rights activist",
'Invisible Man': "Novel, 1952",
'Antoine de Saint-Exupéry': "French writer and aviator",
'Zhuangzi': "Chinese philosopher",
'Neil Armstrong': "First man to walk on the moon",
'Socrates': "Greek philosopher",
'George Washington': "First President of the United States",
'Wassily Kandinsky': "Russian painter and art theorist",
'The Lord of the Rings': "Film, 2001",
'John Barrymore': "American actor",
'Gilbert Keith Chesterton': "English writer and critic",
'Fact about relaxation': "",
'Dwight D. Eisenhower': "34th President of the United States",
'Nicole Richie': "American actress and singer",
'Ernest Hemingway': "American novelist",
'Winston Churchill': "British statesman and prime minister",
'Dr. Seuss': "American children's author",
'Friedrich Nietzsche': "German philosopher",
'Osho': "Indian spiritual leader",
'Francis Bacon': "English philosopher, statesman",
'Laozi': "Chinese philosopher",
'Barbara Kingsolver': "American novelist and essayist",
'Greek proverb': "Greek proverb",
'Epictetus': "Greek philosopher",
'Pablo Picasso': "Spanish painter, sculptor",
'Braveheart': "Film, 1995",
'Kate Douglas Wiggin': "American novelist and playwright",
'Marcus Aurelius': "Roman emperor and philosopher",
'Voltaire': "French philosopher, writer",
'Samuel Butler': "English writer and critic",
'Fact about music': "Fact about music",
'Robert Louis Stevenson': "Scottish novelist",
'The Pursuit of Happyness': "Film, 2006",
'Emanuel Lasker': "German chess player and composer",
'Lao Tzu': "Chinese philosopher",
'Horatio Nelson': "British naval officer",
'Albert Einstein': "German-born theoretical physicist",
'Fact about Surma': "",
'Japanese law': "Japanese law",
'George Matthew Adams': "American writer and critic",
'Mark Halperin': "American political commentator",
'Chinese proverb': "Chinese proverb",
'Samuel Taylor Coleridge': "English poet, novelist, and critic",
'Pericles': "Greek statesman",
'Desmond Tutu': "South African Anglican priest",
'Lucius Annaeus Seneca': "Roman philosopher"
}

export const percentOfLevels ={
  4: '94.6%',
  8: '89.2%',
  12: '76.1%',
  17: '67.5%',
  22: '50.9%',
  28: '43.3%',
  32: '37.7%',
  37: '35.1%',
  48: '33.5%',
  58: '27.9%',
  67: '24.3%',
  72: '24.7%',
  78: '24.1%',
  89: '23.5%',
  100: '22.9%',
  111: '21.6%',
  127: '20.3%',
  139: '19.7%',
  148: '19.1%',
  160: '24.5%',
  172: '17.9%',
  180: '21.3%',
  186: '16.7%',
  200: '16.1%',
  209: '15.5%',
  221: '18.9%',
  236: '21.3%',
  249: '17.7%',
  258: '22.1%',
  265: '17.5%',
  279: '19.9%',
  290: '24.3%',
  301: '20.7%',
  312: '17.1%',
  319: '16.5%',
  333: '15.9%',
  
}
export const levelToOpenDaily = 19;

export const getPercentOfLevels = (type: number) => {
     let percents = percentOfLevels[type as keyof typeof percentOfLevels];
     if(percents === undefined){
          return '90.6%';
     }
     return percents;
}
export const countWordsWithHiddenLetters = (level: LevelData, gameLanguage: string) => {
     const text = level.text.toUpperCase();
     const hiddenIndexes = new Set(level.hiddenIndexes);
   
     // Удаляем знаки препинания и разбиваем на слова с индексами начала и конца
     const words = [];
     let wordStart = null;
   
     for (let i = 0; i <= text.length; i++) {
       const char = text[i];
       const isLetter = !testLetterForNotAlphabet(char, gameLanguage);
   
       if (isLetter) {
         if (wordStart === null) wordStart = i;
       } else {
         if (wordStart !== null) {
           words.push({ start: wordStart, end: i - 1 });
           wordStart = null;
         }
       }
     }
     // Подсчёт слов, в которых есть хотя бы один индекс из hiddenIndexes
     let count = 0;
     for (const { start, end } of words) {
       for (let i = start; i <= end; i++) {
         if (hiddenIndexes.has(i)) {
           count++;
           break;
         }
       }
     }
   
     return count;
   }
export const levelsByCategory: Record<string, LevelData[]> = {
     quotes: [],
     poems: [],
     aphorisms: [],
     music: [],
     cinema: [],
     science: []
}
function replaceLongDashes(text: string) {
     return text.replace(/—/g, '-');
   }
export const formatTime = (seconds: number) => {
     seconds = Math.round(seconds);
     let mins = Math.floor(seconds / 60).toString();
     if(mins.length === 1){
       mins = '0' + mins;
     }
     let secs = (seconds % 60).toString();
     if(secs.length === 1){
       secs = '0' + secs;
     }
     return `${mins}:${secs}`;
}
export const formatSmallTime = (time: number) => {
  let newTime = time.toString();
  if(newTime.length === 1){
    newTime = '0' + newTime;
  }
  return newTime;
}

//Обработка уровней и проверка на ошибки
const regexForDifferentLanguages = {
     'ru': /[а-я]/i,
     'en': /[a-z]/i
}
export let levels: LevelData[] = [];
export let dailyLevels: LevelData[] = [];


function fixLevels(allLevels: LevelData[], language: string){
  const levels = allLevels.map((level: LevelData) => {
      levelsByCategory[level.type as keyof typeof levelsByCategory].push({...level});
      level.text = replaceLongDashes(level.text.replace(/ё/gi, 'е'));
      let test = level.hiddenIndexes;
      level.hiddenIndexes = level.hiddenIndexes
      .filter(index => regexForDifferentLanguages[language as keyof typeof regexForDifferentLanguages]
      .test(level.text[index]));

      if(JSON.stringify(test) !== JSON.stringify(level.hiddenIndexes)){
          console.log("fixed");
      }
      return level;
  })
  return levels;
}

export function initLevels(allLevels: LevelData[], language: string){
  levels = fixLevels(allLevels, language);
}

export function initDailyLevels(allLevels: LevelData[], language: string){
  dailyLevels = fixLevels(allLevels, language);
}

export const testLetterForNotAlphabet = (char: string, language: string) => {
     if(!char) return true;
     if(char.length !== 1) return true;
     if(language === 'ru'){
          return /[^А-ЯЁ]/i.test(char);
     }else{
          return /[^A-Z]/i.test(char);
     }
}
export const keyboardRows = {
     'ru': [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'ъ', 'б', 'ю']
     ],
     'en': [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
     ]
}

export const dices = [
  '000010000',
  '000020000',

  '100000001',
  '100000002',
  '200000001',
  '200000002',

  '100010001',
  '100010002',
  '100020001',
  '100020002',
  '200010001',
  '200010002',
  '200020001',
  '200020002',

  '101000101',
  '201000102',
  '102000201',
  '202000202',
  '102000102',
  '201000201',
  '101000202',
  '202000101',

  '101010101',
  '101020101',
  '102010201',
  '201010102',
  '201020102',
  '102020201',

  '202202101',
  '101202202',
  '202101202',
  '101101202',
  '202101101',
  '101202101',
  '102102102',
  '201201201',
]

