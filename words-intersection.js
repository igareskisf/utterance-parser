/**
 * Finds an intersection between the generated words and the words that are in the blacklist/whitelist
 */

const fs = require('fs');
const path = require('path');
const { readFile, makeDir } = require('./utils/file-helper');

try {
  const outputDir = 'output/words';
  const wordsPath = 'output/words/words.json';
  const blackWordsPath = 'manual-work/words-blacklist.json';
  const whiteWordsPath = 'manual-work/words-whitelist.json';

  const words = readFile(path.join(__dirname, wordsPath));
  const blackWords = readFile(path.join(__dirname, blackWordsPath));
  const whiteWords = readFile(path.join(__dirname, whiteWordsPath));

  if (words && (blackWords || whiteWords)) {
    if (makeDir(outputDir)) {
      console.log(`${outputDir} created`);
    }

    const wordsContent = JSON.parse(words);
    const blackWordsContent = blackWords ? JSON.parse(blackWords) : [];
    const whiteWordsContent = whiteWords ? JSON.parse(whiteWords) : [];

    const result = Object.fromEntries(Object.entries(wordsContent).filter(x => !Object.keys(blackWordsContent).includes(x[0]) && !Object.keys(whiteWordsContent).includes(x[0])));

    const filename = `${outputDir}/words-intersection.json`;

    fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(result, null, 2));
    
    console.log(result);
    console.log(Object.keys(result).length);
  } else {
    console.log('Something is missing, please check');
  }
} catch(e) {
  console.error(e);
}