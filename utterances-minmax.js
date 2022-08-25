/**
 * Lists generated utterances min and max counts
 */

const { readFile } = require('./utils/file-helper');

try {
  const filepath = 'output/utterances/utterances.json';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];
  
  const content = readFile(filepath);

  if (content) {
    const data = JSON.parse(content);
    const filtered = Object.keys(data).filter(key => !blacklistTags.includes(key)).map(key => [key, data[key]]);

    const min = filtered.sort((a, b) => a[1].length > b[1].length ? 1 : -1).filter(x => x[1].length === filtered[0][1].length);
    const max = filtered.sort((a, b) => a[1].length > b[1].length ? -1 : 1).filter(x => x[1].length === filtered[0][1].length);

    const result = {
      min: {
        tag: min.map(x => x[0]).sort(),
        length: min[0][1].length
      },
      max: {
        tag: max.map(x => x[0]).sort(),
        length: max[0][1].length
      }
    }

    console.log(result);
  } else {
    console.log(`${filepath} does not exist`);
  }
} catch(e) {
  console.error(e);
}