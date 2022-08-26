const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv));

try {
  const args = argv.demandOption('source').parse();
  const filepath = './destination'
  const filename = 'utterances.json'
  const workbookPath = `./source/${args.source}`;

  if (!fs.existsSync(path.join(__dirname, workbookPath))) {
    throw new Error(`${workbookPath} does not exist`);
  }
  
  const rawData = xlsx.readFile(path.join(__dirname, workbookPath));
  const sheetNames = rawData.SheetNames.filter(x => x.includes('Intent'));

  let resultObj = {};

  for (const sheet of sheetNames) {
    const data = xlsx.utils.sheet_to_json(rawData.Sheets[sheet]);
    const tmpArr = sheet.split(/(?=[A-Z])/);
    tmpArr.unshift(tmpArr.pop());
    const key = tmpArr.join('_').toLowerCase();

    resultObj[`nlcs_custom_slot_${key}`] = {
      name: sheet,
      utterances: data.map(x => x['Utterances']).filter(y => !!y)
    }
  }

  if (!fs.existsSync(path.join(__dirname, filepath))) {
    fs.mkdirSync(path.join(__dirname, filepath), {
      recursive: true
    });
  }

  fs.writeFileSync(path.join(__dirname, `${filepath}/${filename}`), JSON.stringify(resultObj, null, 2));

  console.log('Done');
} catch(e) {
  console.error(e);
}