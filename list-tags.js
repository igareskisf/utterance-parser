/**
 * Lists all existing tags
 */

const path = require('path');
const { xlsxParser } = require('./utils/file-helper');

try {
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';

  const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
  const tags = [...new Set(rowData.map(x => x['app_tag']).filter(x => !!x).sort())];

  if (tags.length > 0) {
    for (const tag of tags) {
      console.log(tag);
    }
  } else {
    console.log('No tags');
  }
} catch(e) {
  console.error(e);
}