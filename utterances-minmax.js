/**
 * Lists generated utterances min and max counts
 */

const path = require('path');
const { checkLocationExists, readFile, xlsxParser } = require('./utils/file-helper');

try {
  const pathdir = 'output/utterances';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];

  let minObj = {
    size: 1,
    tags: []
  };

  let maxObj = {
    size: 1,
    tags: []
  };

  if (checkLocationExists(path.join(__dirname, pathdir))) {
    const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
    const tags = [...new Set(rowData.map(x => x['app_tag']))].filter(x => !!x && !blacklistTags.includes(x)).sort();

    for (let tag of tags) {
      const filepath = `${pathdir}/${tag}.json`;
      const content = readFile(filepath);

      if (content) {
        const data = JSON.parse(content);
        const size = data.length;

        if (size < minObj.size) {
          minObj.size =  size;
          minObj.tags = [tag];
        } else if (size === minObj.size) {
          minObj.tags.push(tag);
        }

        if (size > maxObj.size) {
          maxObj.size =  size;
          maxObj.tags = [tag];
        } else if (size === maxObj.size) {
          maxObj.tags.push(tag);
        }
      } else {
        console.log(`${filepath} does not exist`);
      }
    }

    const result = {
      min: {
        tag: minObj.tags.sort(),
        length: minObj.size
      },
      max: {
        tag: maxObj.tags.sort(),
        length: maxObj.size
      }
    }

    console.log(result);
  } else {
    console.log(`${pathdir} does not exist`);
  }
} catch(e) {
  console.error(e);
}