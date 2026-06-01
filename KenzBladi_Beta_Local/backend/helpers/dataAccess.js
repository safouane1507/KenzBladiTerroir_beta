const fs = require('fs');
const path = require('path');

exports.readData = (filename) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '../data', filename), 'utf8'));

exports.writeData = (filename, data) =>
  fs.writeFileSync(
    path.join(__dirname, '../data', filename),
    JSON.stringify(data, null, 2),
    'utf8'
  );
