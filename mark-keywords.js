/**
 * Marks the provided triggers and slots in the generated utterances and extracts them along with some data 
 */

const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv));
const { checkLocationExists, readFile, makeDir } = require('./utils/file-helper');

try {
  const args = argv
                .demandOption('tag')
                .demandOption('trigger')
                .choices('type', ['action', 'noun'])
                .default('type', 'noun')
                .default('slot', 'unknown')
                .default('parent', null)
                .boolean('synonim')
                .default('synonim', false).parse();

  const tag = args.tag;
  const trigger = args.trigger;
  const type = args.type;
  const slot = type === 'action' ? `${args.slot}Action` : `${args.slot}Noun`;
  const parent = args.parent;
  const synonim = args.synonim;
  
  const inputDir = 'output/utterances';
  const inputPath = `${inputDir}/${tag}.json`;
  const outputDir = 'output/marked-utterances';
  const outputPath = `${outputDir}/${tag}.json`;
  const triggerOutputDir = 'output/triggers';
  const triggerOutputPath = type === 'action' ? `${triggerOutputDir}/actions.json` : `${triggerOutputDir}/nouns.json`;

  const data = readFile(path.join(__dirname, outputPath)) || readFile(path.join(__dirname, inputPath));

  if (data) {
    const utterances = JSON.parse(data);
    const triggerKey = trigger.replace(' ', '-');
    const triggerData = readFile(path.join(__dirname, triggerOutputPath));
    const triggerContent = triggerData ? JSON.parse(triggerData) : {};
    const triggerExtended = type === 'action' ? trigger.split(' ').join('\\]*\\s\\[*') : trigger.split(' ').join('\\>*\\s\\<*');
    const triggerRegexp = type === 'action' ? new RegExp(`\\[*\\b${triggerExtended}\\b\\]*`, 'g') : new RegExp(`\\<*\\b${triggerExtended}\\b\\>*`, 'g');

    let tagCounter = 0;
        
    for (let utterance of utterances) {
      utterance['placeholder'] = utterance['placeholder'] || utterance['original'];

      if (triggerRegexp.test(utterance['placeholder'])) {
        tagCounter += 1;
        utterance['placeholder'] = utterance['placeholder'].replace(triggerRegexp, matched => type === 'action' ? `[${matched}]` : `<${matched}>`);
      }
    }

    if (!triggerContent[triggerKey]) {
      triggerContent[triggerKey] = {
        type,
        slot,
        synonim,
        parent,
        occurrence: {}
      };
    }


    triggerContent[triggerKey].occurrence[tag] = tagCounter;

    if (!checkLocationExists(triggerOutputDir)) {
      makeDir(triggerOutputDir);
    }

    const orderedTriggers = Object.keys(triggerContent).sort().reduce(
      (item, key) => { 
        item[key] = triggerContent[key]; 
        return item;
      }, {}
    );

    for (const [key, value] of Object.entries(orderedTriggers)) {
      value.occurrence = Object.entries(value.occurrence).sort(([,a], [,b]) => b - a).reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    }

    fs.writeFileSync(triggerOutputPath, JSON.stringify(orderedTriggers, null, 2));

    if (!checkLocationExists(outputDir)) {
      makeDir(outputDir);
    }

    fs.writeFileSync(outputPath, JSON.stringify(utterances, null, 2));
    
    console.log('Done');
  } else {
    console.log(`${inputPath} and ${outputPath} do not exist`);
  }
} catch(e) {
  console.error(e);
}