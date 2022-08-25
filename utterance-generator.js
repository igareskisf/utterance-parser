/** 
 * The main logic and algorithm for filtering out similar utterances 
*/

const path = require('path');
const { makeDir, createFile, readFile, xlsxParser } = require('./utils/file-helper');

try {
  const outputDir = 'output/utterances';
  const wordsPath = 'manual-work/words-blacklist.json';
  const workbookPath = 'data/nbs_tagging_sheet_v2.1.xlsx';
  const sheetName = 'tagging';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];
  const minWords = 2;
  const maxWords = 15;

  let result = {};
  
  const data = readFile(path.join(__dirname, wordsPath));

  if (data) {
    const blacklist = JSON.parse(data);
    const rowData = xlsxParser(path.join(__dirname, workbookPath), sheetName);
    const tags = [...new Set(rowData.map(x => x['app_tag']))].filter(x => !blacklistTags.includes(x)).sort();

    console.log('Total utterances:', rowData.map(x => x['transcription']).filter(x => !!x).length);

    for (let tag of tags) {
      if (tag === undefined) continue;

      let unique = new Set();
      result[tag] = [];

      let transcripts = rowData
                        .filter(x => x['app_tag'] === tag && !!x['transcription'] && x['transcription'].split(' ').length <= maxWords)
                        .map(x => {
                          return {
                            original: x['transcription'],
                            short: [...new Set(x['transcription'].split(' ').filter(y => !Object.keys(blacklist).includes(y)))].join(' ')
                          }
                        })
                        .filter(x => {
                          if (!x['short']) return false;

                          const isDuplicate = unique.has(x['short']);

                          if (!isDuplicate) {
                            unique.add(x['short']);
                            return true;
                          }

                          return false;
                        })
                        .filter(x => x['short'].split(' ').length >= minWords)
                        .sort((a, b) => a['short'].split(' ').length > b['short'].split(' ').length ? -1 : 1);
                          
      for (let i = 0; i < transcripts.length - 1; i++) {
        const longer = transcripts[i]['short'].split(' ');
        
        for (let j = i + 1; j < transcripts.length; j++) {
          const shorter = transcripts[j]['short'].split(' ');
          const cmpLength = shorter.filter(x => longer.includes(x)).length / shorter.length;

          if (
            shorter.length <= 3 && cmpLength >= 1 ||
            shorter.length > 3 && shorter.length <= 6 && cmpLength >= 0.5 ||
            shorter.length > 6 && cmpLength >= 0.4
          ) {            
            transcripts = transcripts.filter(x => x['short'] !== transcripts[j]['short']);
          }          
        }
      }
      
      result[tag] = result[tag].concat(transcripts);
    }

    if (makeDir(outputDir)) {
      const filename = `${outputDir}/utterances.json`;

      if (createFile(path.join(__dirname, filename), JSON.stringify(result, null, 2))) {
        console.log(Object.keys(result).length);
      } else {
        console.log(`${filename} already exists`);
      }
    } else {
      console.log(`${outputDir} already exists`);
    }
  } else {
    console.log(`${wordsPath} does not exist`);
  }
} catch(e) {
  console.error(e);
}