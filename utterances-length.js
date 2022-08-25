
/**
 * Lists generated utterances count by tag and the total count
 */

const { readFile } = require('./utils/file-helper');

try {
  const filepath = 'output/utterances/utterances.json';
  const blacklistTags = ['delete-delete', 'garbage-garbage', 'vague-vague'];
  
  const content = readFile(filepath);

  if (content) {
    const data = JSON.parse(content);
    const filtered = Object.keys(data)
                    .filter(key => !blacklistTags.includes(key))
                    .map(key => [key, data[key]])
                    .sort((a, b) => a[1].length - b[1].length || 0);

    const result = {};
    let total = 0;

    for (let item of filtered) {
      result[item[0]] = item[1].length;
      total += item[1].length;
    }

    console.log(result);
    console.log(total);
  } else {
    console.log(`${filepath} does not exist`);
  }
} catch(e) {
  console.error(e);
}