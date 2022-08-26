const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv));

try {
  const args = argv.demandOption('source').parse();
  const filepath = './destination';
  const filename = 'slots.json';
  const workbookPath = `./source/${args.source}`;
  const sheetName = 'Slot=Noun';

  if (!fs.existsSync(path.join(__dirname, workbookPath))) {
    throw new Error(`${workbookPath} does not exist`);
  }

  const rawData = xlsx.readFile(path.join(__dirname, workbookPath));
  const data = xlsx.utils.sheet_to_json(rawData.Sheets[sheetName]);

  let resultObj = {};
  let slotObj = {};
  let key = null;

  for (let i = 0; i < data.length; i++) {
    const obj = data[i];
    
    if (!obj['SLOT VALUE_1']) continue;
    
    if (obj['SLOT NAME_1']) {
      key = obj['SLOT NAME_1'].split(/(?=[A-Z])/).join('_').toLowerCase();

      slotObj = {
        slot_type_name: obj['SLOT NAME_1'],
        slot_type_description: obj['SLOT NAME_1'],
        slot_type_values: [{
          sample_value: obj['SLOT VALUE_1'],
          synonims: obj['SLOT SYNONYMS_1']?.split(', ')
        }]
      }
    } else {
      if (slotObj.slot_type_values) {
        slotObj.slot_type_values.push({
          sample_value: obj['SLOT VALUE_1'],
          synonims: obj['SLOT SYNONYMS_1']?.split(', ')
        });
      }

      if (key) {
        resultObj[`nlcs_custom_slot_${key}`] = slotObj;
        key = null;
      }

      if (data[i + 1] && data[i + 1]['SLOT NAME_1']) {
        slotObj = {};
      }
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