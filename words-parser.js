/**
 * Extracts all the different words that are found in the filtered utterances
 */

const path = require('path');
const { makeDir, createFile, xlsxParser } = require('./utils/file-helper');

try {
  const outputDir = 'output/words';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];
  const minWords = 2;
  const maxWords = 15;

  const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
  const transcripts = rowData
                      .filter(x => !blacklistTags.includes(x['app_tag']))
                      .map(x => x['transcription'])
                      .filter(x => !!x)
                      .filter(x => x.split(' ').length >= minWords && x.split(' ').length <= maxWords)
                      .sort((a, b) => a.split(' ').length > b.split(' ').length ? 1 : -1);

  // let words = [];
  
  // for (transcript of transcripts) {
  //   words = words.concat(transcript.split(' ').filter(x => !!x));
  // }

  // const result = [...new Set(words)].sort((a, b) => a.length > b.length ? -1 : 1);
  // console.log(result.length);

  let words = {};

  for (const transcript of transcripts) {
    const wordPieces = transcript.split(' ');
    for (piece of wordPieces) {
      if (!piece) continue;
      words[piece] = words[piece] === undefined ? 1 : words[piece] + 1;
    }
  }

  const result = Object.keys(words).sort((a, b) => a.length > b.length ? -1 : 1).reduce((r, k) => (r[k] = words[k], r), {});

  if (makeDir(outputDir)) {
    const filename = `${outputDir}/words.json`;

    if (createFile(path.join(__dirname, filename), JSON.stringify(result, null, 2))) {
      console.log()
      console.log(result);
      console.log(Object.keys(result).length);
    } else {
      console.log(`${filename} already exists`);
    }
  } else {
    console.log(`${outputDir} already exists`);
  }
} catch(e) {
  console.error(e);
}