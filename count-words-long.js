
/**
 * Count each utterance's words, not including the utterances from the blacklisted tags
 */

const path = require('path');
const { xlsxParser } = require('./utils/file-helper');

try {
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];

  const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
  const transcripts = rowData.filter(x => !!x['transcription'] && !blacklistTags.includes(x['app_tag'])).map(x => x['transcription']);

  let words = {};

  console.log(transcripts.length);

  for (transcript of transcripts) {
    const count = transcript.split(' ').length;
    words[count] = words[count] !== undefined ? words[count] + 1 : 1;
  }

  console.log(words);
} catch(e) {
  console.error(e);
}