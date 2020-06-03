const router = require('express').Router();
const pool = require('../db/db');

// word router
router
  .route("/")
  .post(async (req, res) => {
    try {
      const { content, language } = req.body;
      const newWord = await pool.query(
        "INSERT INTO word(content, language) VALUES($1, $2)",
        [content, language]
      );
      res.json(newWord);
    } catch (err) {
      console.error(err);
    }
  })
  .get(async (req, res) => {
    try {
      const words = await pool.query("SELECT * FROM word");
      res.json(words.rows);
    } catch (err) {
      console.error(err);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const word = await pool.query(
        "SELECT * FROM word WHERE id = $1",
        [id]
      );
      res.json(word.rows[0]);
    } catch (err) {
      console.error(err);
    }
  })
  .put(async (req, res) => {
    try {
      const { id } = req.params;
      const { content, language } = req.body;
      const updatedWord = await pool.query(
        "UPDATE word SET content = $2, language = $3 WHERE id = $1",
        [id, content, language]
      );
      res.json({
        updated: true
      });
    } catch (err) {
      console.error(err);
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      const deletedWord = await pool.query(
        "DELETE FROM word WHERE id = $1",
        [id]
      );
      res.json({
        deleted: true
      });
    } catch (err) {
      console.error(err);
    }
  });

module.exports = router;
