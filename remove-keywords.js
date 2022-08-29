/**
 * Removes the provided triggers and slots from the generated utterances
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
                .default('parent', null)
                .boolean('synonim')
                .default('synonim', false)
                .parse();

  const tag = args.tag;
  const trigger = args.trigger;
  const type = args.type;
  const parent = args.parent;
  const synonim = args.synonim;
  
  const dir = 'output/marked-utterances';
  const filepath = `${dir}/${tag}.json`;
  const triggerDir = 'output/triggers';
  const triggerPath = type === 'action' ? `${triggerDir}/actions.json` : `${triggerDir}/nouns.json`;

  const data = readFile(path.join(__dirname, filepath));

  if (data) {
    const utterances = JSON.parse(data);
    const triggerKey = trigger.replace(/\s/g, '-');
    const parentKey = parent ? parent.replace(/\s/g, '-') : null;
    const triggerData = readFile(path.join(__dirname, triggerPath));
    const triggerContent = triggerData ? JSON.parse(triggerData) : {};
    const triggerExtended = type === 'action' ? trigger.split(' ').join('\\]*\[\\s\\w]*\\[*') : trigger.split(' ').join('\\>*[\\s\\w]*\\<*');
    const triggerRegexp = type === 'action' ? new RegExp(`\\[*\\b${triggerExtended}\\b\\]*`, 'g') : new RegExp(`\\<*\\b${triggerExtended}\\b\\>*`, 'g');
        
    for (let utterance of utterances) {
      if (triggerRegexp.test(utterance['placeholder'])) {
        utterance['placeholder'] = utterance['placeholder'].replace(triggerRegexp, matched => type === 'action' ? matched.replace(/[\[,\]]/g, '') : matched.replace(/[\<,\>]/g, ''));
      }
    }

    if (!synonim) {
      triggerContent[triggerKey].occurrence = Object.keys(triggerContent[triggerKey].occurrence)
                                              .filter(key => key !== tag)
                                              .reduce((obj, key) => {
                                                obj[key] = triggerContent[triggerKey].occurrence[key];
                                                return obj;
                                              }, {});
    } else {
      if (!parentKey || !triggerContent[parentKey] || !triggerContent[parentKey].synonims[triggerKey]) {
        throw new Error('You cannot remove a synonim for a non-existing trigger and/or tag');
      }

      triggerContent[parentKey].synonims[triggerKey].occurrence = Object.keys(triggerContent[parentKey].synonims[triggerKey].occurrence)
                                                                  .filter(key => key !== tag)
                                                                  .reduce((obj, key) => {
                                                                    obj[key] = triggerContent[parentKey].synonims[triggerKey].occurrence[key];
                                                                    return obj;
                                                                  }, {});
    }    

    if (!checkLocationExists(triggerPath)) {
      makeDir(triggerPath);
    }
    
    fs.writeFileSync(triggerPath, JSON.stringify(triggerContent, null, 2));

    if (!checkLocationExists(dir)) {
      makeDir(dir);
    }

    fs.writeFileSync(filepath, JSON.stringify(utterances, null, 2));
    
    console.log('Done');
  } else {
    console.log(`${filepath} does not exist`);
  }
} catch(e) {
  console.error(e);
}