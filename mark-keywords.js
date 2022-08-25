/**
 * Marks the provided triggers and slots in the generated utterances and extracts them along with some data 
 */

const fs = require('fs');
const path = require('path');
const { xlsxParser } = require('./utils/file-helper');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv));
const { checkLocationExists, readFile } = require('./utils/file-helper');

try {
  const args = argv.array('trigger').array('slot').parse();
  const tag = args.tag || null;
  const triggers = [...new Set(args.trigger)] || [];
  const slots = [...new Set(args.slot)] || [];
  
  const inputDir = 'output/utterances';
  const inputPath = `${inputDir}/utterances.json`;
  const outputDir = 'output/marked-utterances';
  const outputPath = `${outputDir}/marked-utterances.json`;
  const triggerSlotOutputDir = 'output/slots-triggers';
  const triggerOutputPath = `${triggerSlotOutputDir}/triggers.json`;
  const slotOutputPath = `${triggerSlotOutputDir}/slots.json`;
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';

  let triggerObj = {};
  let slotObj = {};

  const data = readFile(path.join(__dirname, outputPath)) || readFile(path.join(__dirname, inputPath));

  if (data) {
    const content = JSON.parse(data);
    const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
    let tags = [...new Set(rowData.map(x => x['app_tag']).filter(x => !!x).sort())];

    if (tag) {
      tags = tags.filter(x => x === tag);
    }

    for (let tag of tags) {
      const utterances = content[tag] || [];

      let replaced = [];
      
      for (let utterance of utterances) {        
        for (let trigger of triggers) {
          // const triggerRegexp = new RegExp(`(?<!\\[)\\b${trigger}\\b(?!\\])`);
          const tmp = trigger.split(' ').join('\\]*\\s\\[*');
          const triggerRegexp = new RegExp(`\\[*\\b${tmp}\\b\\]*`, 'g');

          if (triggerRegexp.test(utterance['original'])) {
            utterance['original'] = utterance['original'].replace(triggerRegexp, matched => `[${matched}]`);
            const triggerKey = trigger.replace(' ', '-');

            if (triggerObj[triggerKey] === undefined) {
              triggerObj[triggerKey] = {
                type: 'trigger',
                slotNoun: '',
                synonim: false,
                index: 0,
                occurrence: {}
              }

              triggerObj[triggerKey].occurrence[tag] = 1;
            } else {
              if (triggerObj[triggerKey].occurrence !== undefined) {
                if (triggerObj[triggerKey].occurrence[tag] !== undefined) {
                  triggerObj[triggerKey].occurrence[tag] += 1;
                } else {
                  triggerObj[triggerKey].occurrence[tag] = 1;
                }
              }
            }
          }
        }
        
        for (let slot of slots) {
          // const slotRegexp = new RegExp(`(?<!\\<)\\b${slot}\\b(?!\\>)`);
          const tmp = slot.split(' ').join('\\>*\\s\\<*');
          const slotRegexp = new RegExp(`\\<*\\b${tmp}\\b\\>*`, 'g');

          if (slotRegexp.test(utterance['original'])) {
            utterance['original'] = utterance['original'].replace(slotRegexp, matched => `<${matched}>`);
            const slotKey = slot.replace(' ', '-');
            
            if (slotObj[slotKey] === undefined) {
              slotObj[slotKey] = {
                type: 'slot',
                slotNoun: '',
                synonim: false,
                index: 0,
                occurrence: {}
              }

              slotObj[slotKey].occurrence[tag] = 1;
            } else {
              if (slotObj[slotKey].occurrence !== undefined) {
                if (slotObj[slotKey].occurrence[tag] !== undefined) {
                  slotObj[slotKey].occurrence[tag] += 1;
                } else {
                  slotObj[slotKey].occurrence[tag] = 1;
                }
              }
            }
          }
        }

        replaced.push({
          original: utterance['original'],
          short: utterance['short']
        });
      }

      content[tag] = replaced;
    }

    if (!checkLocationExists(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true
      });
    }

    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2));

    if (!checkLocationExists(triggerSlotOutputDir)) {
      fs.mkdirSync(triggerSlotOutputDir, {
        recursive: true
      });
    }

    let triggerTmpObj = {};
    let slotTmpObj = {};

    const triggerData = readFile(path.join(__dirname, triggerOutputPath));
    const slotData = readFile(path.join(__dirname, slotOutputPath));
    
    if (triggerData) {
      triggerTmpObj = {
        ...triggerObj,
        ...JSON.parse(triggerData)
      }
    } else {
      triggerTmpObj = {
        ...triggerObj
      }
    }

    if (slotData) {
      slotTmpObj = {
        ...slotObj,
        ...JSON.parse(slotData)
      }
    } else{
      slotTmpObj = {
        ...slotObj
      }
    }
    
    const orderedTriggers = Object.keys(triggerTmpObj).sort().reduce(
      (item, key) => { 
        item[key] = triggerTmpObj[key]; 
        return item;
      }, {}
    );

    const orderedSlots = Object.keys(slotTmpObj).sort().reduce(
      (item, key) => { 
        item[key] = slotTmpObj[key]; 
        return item;
      }, {}
    );

    for (const [key, value] of Object.entries(orderedTriggers)) {
      value.occurrence = Object.entries(value.occurrence).sort(([,a], [,b]) => b - a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    }

    for (const [key, value] of Object.entries(orderedSlots)) {
      value.occurrence = Object.entries(value.occurrence).sort(([,a], [,b]) => b - a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    }

    if (!checkLocationExists(triggerSlotOutputDir)) {
      fs.mkdirSync(triggerSlotOutputDir, {
        recursive: true
      });
    }

    fs.writeFileSync(triggerOutputPath, JSON.stringify(orderedTriggers, null, 2));
    fs.writeFileSync(slotOutputPath, JSON.stringify(orderedSlots, null, 2));

    console.log('Done');
  } else {
    console.log(`${inputPath} and ${outputPath} do not exist`);
  }
} catch(e) {
  console.error(e);
}