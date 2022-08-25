const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv));

try {
  const args = argv.demandOption('source').parse();
  const workbookPath = `./source/${args.source}`;

  if (!fs.existsSync(path.join(__dirname, workbookPath))) {
    throw new Error(`${workbookPath} does not exist`);
  }
  
  const rawData = xlsx.readFile(path.join(__dirname, workbookPath));
  const sheetNames = rawData.SheetNames.filter(x => x.includes('Intent'));

  let resultObj = {};

  for (const sheet of sheetNames) {
    const data = xlsx.utils.sheet_to_json(rawData.Sheets[sheet]);
    const uniqueUtterances = [];
    const duplicateUtterances = [];
    const uniqueSlotValues = [];
    const duplicateSlotValues = [];

    for (const item of data) {
      if (!item['Utterances']) continue;
      
      if (uniqueUtterances.includes(item['Utterances'])) {
        duplicateUtterances.push(item['Utterances']);
      } else {
        uniqueUtterances.push(item['Utterances']);
      }
    }

    for (const item of data) {
      if (!item['Acceptable Nouns']) continue;

      const tmp = item['Acceptable Nouns'].replace(',', '').split(' ').sort().join(' ');

      if (uniqueSlotValues.includes(tmp)) {
        duplicateSlotValues.push(item['Acceptable Nouns']);
      } else {
        uniqueSlotValues.push(tmp);
      }
    }

    resultObj[sheet] = {
      duplicateUtterances,
      duplicateSlotValues
    }
  }

  console.log(JSON.stringify(resultObj, null, 2));
} catch(e) {
  console.error(e);
}