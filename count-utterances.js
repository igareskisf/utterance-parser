/** 
 * Count the total number of utterances
*/

const path = require('path');
const { xlsxParser } = require('./utils/file-helper');

try {
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];
  
  const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);

  console.log('Total utterances before filter:', rowData.map(x => x['transcription']).filter(x => !!x).length);
  console.log('Total utterances after filter:', rowData.filter(x => !blacklistTags.includes(x['app_tag'])).map(x => x['transcription']).filter(y => !!y).length);
} catch(e) {
  console.error(e);
}