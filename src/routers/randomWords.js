const router = require("express").Router();
const pool = require("../db/db");

String.prototype.capitalize = function () {
  return this.replace(/^\w/, c => c.toUpperCase());
};

// just return a random word
router.get("/", (req, res) => {
  const { type } = req.query;
  switch (type) {
    case "array-of-words":
      arrayOfWords(req, res);
      break;
    case "sentence-of-words":
      sentenceOfWords(req, res);
      break;
    default:
      standard(req, res);
      break;
  }
});

// return single random word
async function standard(req, res) {
  let { lang } = req.query;
  lang = lang || "en";
  
  const options = req.body.options || [];

  let randomWord = await getRandomWord(lang);
  randomWord = modifyByOptions(randomWord, options);

  if (randomWord == -1) {
    res.status(400).json({ error: "Bad Request", status: 400 });
  }

  res.status(200).json(randomWord);
}

async function arrayOfWords(req, res) {
  const { amount } = req.query;
  let { lang } = req.query;
  lang = lang || "en";

  const options = req.body.options || [];

  let arrayOfWords = await getArrayOfWords(lang, amount, options);


  res.status(200).json(arrayOfWords);
}

async function sentenceOfWords(req, res) {
  const { amount } = req.query;
  let { lang } = req.query;
  lang = lang || "en";

  const options = req.body.options || [];
  const sentenceOptions = req.body.sentenceOptions || [];

  // special handling for raw option
  const rawIndex = options.indexOf('raw');
  let rawIncluded = false;

  if (rawIndex !== -1) {
    rawIncluded = true;
    options.splice(rawIndex, 1);
  } 

  console.log(options);
  let sentenceOfWords = await getSentenceOfWords(amount, 
    sentenceOptions, 
    options,
    getRandomWord.bind(this, lang)
  );

  const sentence = sentenceOfWords.join(' ');

  if (rawIncluded) {
    sentenceOfWords = {
      sentenceArray: sentenceOfWords,
      sentence,
      language: lang
    }
  } else {
    sentenceOfWords = sentence;
  }

  res.status(200).json(sentenceOfWords);
}

async function getSentenceOfWords(sentenceAmount, sentenceOptions, options, getRandomWord) {
  let { min, max, commaIndices } = sentenceOptions;
  min = min || 8;
  max = max || 12;

  min = Math.ceil(min);
  max = Math.floor(max);

  sentenceAmount = sentenceAmount || 1;
  
  let allWords = [];

  for (let i = 0; i < sentenceAmount; i++) {
    amount = Math.floor(Math.random() * (max - min + 1)) + min;
    // getArrayOfWords gets the amount of words
    const words = await getArrayOfWords(amount, options, getRandomWord);

    // make the sentence
    // capitalize first word
    words[0] = words[0].capitalize();
    // append . to last word
    words[words.length - 1] = words[words.length - 1] + '.';

    // comma
    // if elements are multiple times in the array chance
    // is higher to set a comma at the index
    commaIndices = commaIndices || [
      null,
      null,
      null,
      [3],
      [4],
      [3, 5],
      [4, 6],
      null,
      null,
      null,
      [3],
      [4],
      [3, 5],
      [4, 6],
      [7]
    ];

    const setCommaAt = commaIndices[Math.floor(Math.random() * commaIndices.length)];

    if (setCommaAt) {
      setCommaAt.forEach(elem => {
        // -2 cause comma at last word wouldnt make sense
        if (elem < words.length - 2) {
          words[elem] = words[elem] + ',';
        }
      });
    }

    allWords = allWords.concat(words);
  }
  
  return allWords;
}

async function getArrayOfWords(amount, options, getRandomWord) {
  const words = [];
  for (let i = 0; i < amount; i++) {
    let randomWord = await getRandomWord();
    randomWord = modifyByOptions(randomWord, options);

    words.push(randomWord);
  }
  return words;
}

async function getRandomWord(lang) {
  try {
    const data = await pool.query("SELECT * FROM word WHERE language = $1", [
      lang
    ]);
    const words = data.rows;
    return words[Math.floor(Math.random() * words.length)];
  } catch (err) {
    console.error(err);
    return -1;
  }
}

// word need to be in schema { id, content, language }
// the content value should be a string
function modifyByOptions(data, options) {
  data.content = transformWord(data.content, options);

  // word = { id: Number, content: String, language: String }
  let word = data;

  // if raw is not included in options map object into single string
  if (!options.includes("raw")) {
    // word = String
    word = data.content;
  }

  // if the word is raw if will convert word into a String and lose the reference
  // so return for savety

  // word could be an object or a string
  return word;
}

function transformWord(word, options) {
  if (options.includes("uppercase")) word = word.toUpperCase();

  if (options.includes("lowercase")) word = word.toLowerCase();

  if (options.includes("capitalize")) word = word.capitalize();

  return word;
}

module.exports = router;
