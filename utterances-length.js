
/**
 * Lists generated utterances count by tag and the total count
 */

const path = require('path');
const { checkLocationExists, readFile, xlsxParser } = require('./utils/file-helper');

try {
  const pathdir = 'output/utterances';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];

  let total = 0;

  if (checkLocationExists(path.join(__dirname, pathdir))) {
    const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
    const tags = [...new Set(rowData.map(x => x['app_tag']))].filter(x => !!x && !blacklistTags.includes(x)).sort();

    for (let tag of tags) {
      const filepath = `${pathdir}/${tag}.json`;
      const content = readFile(filepath);

      if (content) {
        const data = JSON.parse(content);
        total += data.length;
        console.log(`${tag}: ${data.length}`);
      } else {
        console.log(`${filepath} does not exist`);
      }
    }

    console.log(`\nTotal: ${total}`);
  } else {
    console.log(`${pathdir} does not exist`);
  }
} catch(e) {
  console.error(e);
}