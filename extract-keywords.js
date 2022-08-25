/**
 * Saves provided triggers and/or slots for a given tag 
 */

const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv));
const { xlsxParser } = require('./utils/file-helper');
const { makeDir, readFile } = require('./utils/file-helper');

try {
  const args = argv.array('trigger').array('slot').demandOption('tag').parse();
  const tag = args.tag;
  const triggers = args.trigger || [];
  const slots = args.slot || [];
  
  const outputDir = 'output/keywords';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';

  const obj = {
    triggers,
    slots
  }

  const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
  const tags = [...new Set(rowData.map(x => x['app_tag']).filter(x => !!x).sort())];

  if (tags.includes(tag)) {
    if (makeDir(outputDir)) {
      console.log(`${outputDir} created`);
    }

    const filepath = `${outputDir}/${tag}.json`;
    const content = readFile(filepath);

    if (content) {
      const data = JSON.parse(content);
      obj.triggers = obj.triggers.concat(data['triggers']);
      obj.slots = obj.slots.concat(data['slots']);
    }

    obj.triggers = [...new Set(obj.triggers)];
    obj.slots = [...new Set(obj.slots)];

    fs.writeFileSync(path.join(__dirname, filepath), JSON.stringify(obj, null, 2));
    console.log(`${filepath} created`);
  } else {
    console.log(`Invalid tag ${tag}`);
  }
} catch(e) {
  console.error(e);
}