
/**
 * Count each utterance's words after filtering out the blacklisted words, not including the utterances from the blacklisted tags
 */

const path = require('path');
const { readFile, xlsxParser } = require('./utils/file-helper');

try {
  const wordsPath = 'manual-work/words-blacklist.json';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];
  
  const data = readFile(path.join(__dirname, wordsPath));

  if (data) {
    const blacklist = JSON.parse(data);
    const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);

    let unique = new Set();

    const transcripts = rowData
                        .filter(x => !!x['transcription'] && !blacklistTags.includes(x['app_tag']))
                        .map(x => [...new Set(x['transcription'].split(' ').filter(y => !Object.keys(blacklist).includes(y)))].join(' '))
                        .filter(x => {
                          if (!x) return false;

                          const isDuplicate = unique.has(x);

                          if (!isDuplicate) {
                            unique.add(x);
                            return true;
                          }

                          return false;
                        });

    let words = {};

    console.log(transcripts);

    for (transcript of transcripts) {
      const count = transcript.split(' ').length;
      words[count] = words[count] !== undefined ? words[count] + 1 : 1;
    }

    console.log(words);
  } else {
    console.log(`${wordsPath} does not exist`);
  }
} catch(e) {
  console.error(e);
}