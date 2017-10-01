const KJV = require('./../dest/models').KJV;
const fs = require('fs');
const readline = require('readline');
const filename = 'data/raw/kjv.csv';

const data=fs.readFileSync(filename);
const lineCount = data.toString().split('\n').length - 1;

const rl = readline.createInterface({
  input: fs.createReadStream(filename)
});


function split(s, separator, limit) {
  let arr = s.split(separator, limit);
  const left = s.substring(arr.join(separator).length + separator.length);
  arr.push(left);
  return arr;
}

const verses = [];
console.log('Loading verses...');
rl.on('line', (line) => {
  let info = split(line, ',', 3),
    book = parseInt(info[0], 10),
    chapter = parseInt(info[1], 10),
    verse = parseInt(info[2], 10),
    text = info[3];
  if (text[0] == '"' && text[text.length -1] == '"') {
    text = text.substring(1, text.length-1);
  }

  verses.push({
    book,
    chapter,
    verse,
    text
  });
  
  if (verses.length === lineCount) {
    addVerses();
  }
});

function addVerses() {
  KJV.remove({}, () => {
    KJV.collection.insert(verses, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Added ${verses.length} verses`);
        process.exit();
      }
    })
  });
}
