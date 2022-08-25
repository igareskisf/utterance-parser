const fs = require('fs');
const xlsx = require('xlsx');

const checkLocationExists = (path) => {
  return fs.existsSync(path);
}

const makeDir = (dir) => {
  if (!checkLocationExists(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
    return true;
  } else {
    return false;
  }
}

const createFile = (filepath, data) => {
  if (!checkLocationExists(filepath)) {
    fs.writeFileSync(filepath, data);
    return true;
  } else {
    return false;;
  }
}

const readFile = (filepath) => {
  if (checkLocationExists(filepath)) {
    const data = fs.readFileSync(filepath);
    return data;
  } else {
    return null;;
  }
}

const xlsxParser = (filepath, sheetName) => {
  const data = xlsx.readFile(filepath);
  const sheet = data.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet);
}

module.exports = {
  checkLocationExists,
  makeDir,
  createFile,
  readFile,
  xlsxParser
}