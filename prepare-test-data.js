/**
 * Prepares the data for testing by tag
 */

const path = require('path');
const { makeDir, readFile, createFile, xlsxParser } = require('./utils/file-helper');

try {
  const outputDir = 'output/test-data';
  const wordsPath = 'manual-work/words-blacklist.json';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];
  const minWords = 2;
  const maxWords = 15;

  const data = readFile(path.join(__dirname, wordsPath));

  if (data) {
    const blacklist = JSON.parse(data);
    const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
    const tags = [...new Set(rowData.map(x => x['app_tag']))].filter(x => !blacklistTags.includes(x)).sort();
    
    if (makeDir(outputDir)) {
      console.log(`${outputDir} created`);
    } else {
      console.log(`${outputDir} already exists`);
    }

    for (let tag of tags) {
      if (tag === undefined) continue;

      let unique = new Set();

      const transcripts = rowData
                          .filter(x => x['app_tag'] === tag && !!x['transcription'] && x['transcription'].split(' ').length <= maxWords)
                          .map(x => {
                            return {
                              original: x['transcription'],
                              short: [...new Set(x['transcription'].split(' ').filter(y => !Object.keys(blacklist).includes(y)))].join(' ')
                            }
                          })
                          .filter(x => {
                            if (!x['short']) return false;

                            const isDuplicate = unique.has(x['short']);

                            if (!isDuplicate) {
                              unique.add(x['short']);
                              return true;
                            }

                            return false;
                          })
                          .filter(x => x['short'].split(' ').length >= minWords)
                          .sort((a, b) => a['short'].split(' ').length > b['short'].split(' ').length ? -1 : 1);
                          
      const filename = `${outputDir}/${tag}.json`;

      if (createFile(path.join(__dirname, filename), JSON.stringify(transcripts, null, 2))) {
        console.log(`${filename} created`);
      } else {
        console.log(`${filename} already exists`);
      }
    }
  } else {
    console.log(`${wordsPath} does not exist`);
  }
} catch(e) {
  console.error(e);
}