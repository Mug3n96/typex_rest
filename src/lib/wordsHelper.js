async function getSentenceOfWords(sentenceAmount, 
  sentenceOptions, options, getWord) {
  let { min, max, commaIndices } = sentenceOptions;
  min = min || 8;
  max = max || 12;

  sentenceAmount = sentenceAmount || 1;
  
  let allWords = [];

  for (let i = 0; i < sentenceAmount; i++) {
    amount = random(min, max);
    // getArrayOfWords gets the amount of words
    const words = await getArrayOfWords(amount, options, getWord);

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

    const setCommaAt = 
      commaIndices[Math.floor(Math.random() * commaIndices.length)];

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

async function getArrayOfWords(amount, options, getWord) {
  const words = [];
  console.log(amount);
  for (let i = 0; i < amount; i++) {
    let randomWord = await getWord();
    randomWord = modifyByOptions(randomWord, options);
    words.push(randomWord);
  }
  return words;
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

function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  getSentenceOfWords,
  getArrayOfWords,
  modifyByOptions,
  transformWord,
  random
}
