/**
 * Lists all the utterances for the provided tag, after filtering out by the provided parameters
 */

const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv));
const { readFile, xlsxParser } = require('./utils/file-helper');

try {
  const args = argv.demandOption('tag').parse();
  const tag = args.tag;

  const wordsPath = 'manual-work/words-blacklist.json';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const minWords = 2;
  const maxWords = 15;

  const data = readFile(path.join(__dirname, wordsPath));

  if (data) {
    const blacklist = JSON.parse(data);
    const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);

    let unique = new Set();

    const transcripts = rowData
                        .filter(x => x['app_tag'] === tag && !!x['transcription'] && x['transcription'].split(' ').length <= maxWords)
                        .map(x => [...new Set(x['transcription'].split(' ').filter(y => !Object.keys(blacklist).includes(y)))].join(' '))
                        .filter(x => {
                          if (!x) return false;

                          const isDuplicate = unique.has(x);

                          if (!isDuplicate) {
                            unique.add(x);
                            return true;
                          }

                          return false;
                        })
                        .filter(x => x.split(' ').length >= minWords)
                        .sort((a, b) => a.split(' ').length > b.split(' ').length ? -1 : 1);

    if (transcripts.length > 0) {
      for (const transcript of transcripts) {
        console.log(transcript);
      }

      console.log(transcripts.length);
    } else {
      console.log('No transcripts or wrong tag');
    }
  } else {
    console.log(`${wordsPath} does not exist`);
  }
} catch(e) {
  console.error(e);
}