const router = require('express').Router();
const pool = require('../db/db');

String.prototype.capitalize = function () {
  return this.replace(/^\w/, c => c.toUpperCase());
};

// just return a random word
router.get('/', (req, res) => {
  standard(req, res);
});

// return single random word
async function standard(req, res) {
  try {
    let { lang } = req.query;
    const { capitalize, uppercase, lowercase } = req.body;

    lang = lang ? lang : 'en';
    
    const data = await pool.query(
      "SELECT * FROM word WHERE language = $1",
      [lang]
    );

    const words = data.rows;
    const randomWord = words[Math.floor(Math.random() * words.length)];

    if (capitalize)
      randomWord.content = randomWord.content.capitalize();

    if (uppercase)
      randomWord.content = randomWord.content.toUpperCase();

    if (lowercase)
      randomWord.content = randomWord.content.toLowerCase();

    res.json(randomWord);
  } catch (err) {
    console.error(err);
  }
}


module.exports = router;
