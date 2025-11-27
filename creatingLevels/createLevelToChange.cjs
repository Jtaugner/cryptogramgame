const { captureRejectionSymbol } = require('events');
const { promises: fsp } = require('fs');
var path = require('path');
let language = 'ru';
const { levelsData } = require(`./levelsToChange.js`);
const { createLevel } = require(`./createLevel.cjs`);
let newLevelsToChange = [];
levelsData.forEach(level => {
     newLevelsToChange.push(createLevel(level, 3, 0.05));
});
fsp.writeFile(path.join(__dirname, 'newLevelsToChange.js'),
 `export const levelsToChange = [
 ${levelsData.map(result => '\n' + JSON.stringify(result) )}
 \n]`);