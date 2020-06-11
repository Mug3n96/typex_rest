const router = require("express").Router();
const pool = require("../db/db");
const { getSentenceOfWords, getArrayOfWords, modifyByOptions, random } = 
  require('../lib/wordsHelper.js');

String.prototype.capitalize = function () {
  return this.replace(/^\w/, c => c.toUpperCase());
};

// just return a random word
router.get("/", (req, res) => {
  const { type } = req.query;
  switch (type) {
    case "array":
      arrayOfWords(req, res);
      break;
    case "sentence":
      sentenceOfWords(req, res);
      break;
    default:
      standard(req, res);
      break;
  }
});

// return single random word
async function standard(req, res) {
  let { lang, generator, tier } = req.query;
  lang = lang || "en";
  generator = generator || '';

  const baseURL = req.baseUrl;
  const options = req.body.options || [];
  const { generatorOptions } = req.body;
  let word = '';

  console.log(tier);

  switch (baseURL) {
    case '/api/v1/randomWords':
      word = await getRandomWord(lang);
      word = modifyByOptions(word, options);
      break;
    case '/api/v1/customWords':
      word = getCustomWord(generator, generatorOptions);
      word = modifyByOptions(word, options);
      break;
    case '/api/v1/abstractWords':
      word = await getAbstractWord(lang, tier);
      word = modifyByOptions(word, options);
      break;
  }


  if (word == -1) {
    res.status(400).json({ error: "Bad Request", status: 400 });
  }

  res.status(200).json(word);
}

async function arrayOfWords(req, res) {
  let { amount } = req.query;
  let { lang, generator } = req.query;
  lang = lang || "en";
  generator = generator || '';
  amount = amount || 1;
  const { generatorOptions } = req.body;

  const options = req.body.options || [];
  let arrayOfWords = [];

  const baseURL = req.baseUrl;

  switch (baseURL) {
    case '/api/v1/randomWords':
        arrayOfWords = await getArrayOfWords(amount, 
        options, 
        getRandomWord.bind(this, lang)
      );
      break;
    case '/api/v1/customWords':
        arrayOfWords = await getArrayOfWords(amount, 
        options, 
        getCustomWord.bind(this, generator, generatorOptions)
      );
      break;
  }

  res.status(200).json(arrayOfWords);
}

async function sentenceOfWords(req, res) {
  const { amount } = req.query;
  let { lang, generator } = req.query;
  lang = lang || "en";

  generator = generator || '';

  const { generatorOptions } = req.body;

  const options = req.body.options || [];
  const sentenceOptions = req.body.sentenceOptions || [];

  // special handling for raw option
  const rawIndex = options.indexOf('raw');
  let rawIncluded = false;

  if (rawIndex !== -1) {
    rawIncluded = true;
    options.splice(rawIndex, 1);
  } 

  const baseURL = req.baseUrl;
  
  let sentenceOfWords;

  switch (baseURL) {
    case '/api/v1/randomWords':
        sentenceOfWords = await getSentenceOfWords(amount, 
          sentenceOptions, 
          options,
          getRandomWord.bind(this, lang)
        );
      break;
    case '/api/v1/customWords':
        sentenceOfWords = await getSentenceOfWords(amount, 
          sentenceOptions, 
          options,
          getCustomWord.bind(this, generator, generatorOptions)
        );
      break;
  }


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

function getCustomWord(generator, generatorOptions = {}) {
  let { min = 3, max = 8 } = generatorOptions;

  if (generator === '')
    return { content: '' }
  generator = decodeURIComponent(generator);
  let word = ''
  // custom words have length of 3 - 8
  const wordLength = random(min, max);
  for (let i = 0; i < wordLength; i++) {
    word = word + pickRandomCharOfString(generator);
  }
  return { content: word };
}

async function getAbstractWord(lang, tier) {
  let generator = '';
  try {
    const data = await pool.query(
      "SELECT * FROM letter WHERE language = $1 AND tier = $2",
      [lang, tier]
    );
    const dataRows = data.rows;
    dataRows.forEach( elem => {
      generator += elem.content;
    });
    const word = getCustomWord(generator).content;
    return { content: word, language: lang, tier: tier }
  } catch (err) {
    console.error(err);
    return 1;
  }
}

function pickRandomCharOfString(string) {
  return string[Math.floor(Math.random() * string.length)];
}

module.exports = router;
