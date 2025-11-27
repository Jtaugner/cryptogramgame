import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const inputFile = path.join(__dirname, '/es/dg_es.txt');
  const outputFile = path.join(__dirname, 'levelsData.js');

  const content = await fsp.readFile(inputFile, 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

  function parseLine(line) {
    const firstComma = line.indexOf(',');
    if (firstComma === -1) return null;

    const rest = line.slice(firstComma + 1).trim();
    const regex = /^"(.+?)","(.+?)"$/;
    const match = rest.match(regex);

    if (!match) return null;

    return { text: match[1], name: match[2] };
  }

  const parsed = lines.map(parseLine).filter(Boolean);

  // --- ФИЛЬТРАЦИЯ ДУБЛИКАТОВ ПО text ---
  const seenTexts = new Set();
  const result = [];

  for (const item of parsed) {
    if (!seenTexts.has(item.text)) {
      seenTexts.add(item.text);
      result.push(item);
    }
  }

  // --- Формирование файла ---
  const jsContent =
`export const levelsData = [
${result.map(r => `  { text: "${r.text.replace(/"/g, '\\"')}", name: "${r.name.replace(/"/g, '\\"')}" }`).join(',\n')}
];
`;

  await fsp.writeFile(outputFile, jsContent, 'utf8');

  console.log('Готово: создан файл levelsData.js (уникальные text)');
}

run();
