const router = require("express").Router();
const pool = require("../db/db");

router
  .route("/")
  .post(async (req, res) => {
    try {
      const { content, language, tier } = req.body;
      const newLetter = await pool.query(
        "INSERT INTO letter(content, language, tier) VALUES($1, $2, $3)",
        [content, language, tier]
      );
      res.json(newLetter.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.json({});
    }
  })
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const letter = await pool.query("SELECT * FROM letter");
      res.json(letter.rows);
    } catch (err) {
      console.error(err);
    }
  });

router
  .route("/:id")
  .put(async (req, res) => {
    try {
      const { id } = req.params;
      const { content, language, tier } = req.body;
      const updatedLetter = await pool.query(
        `UPDATE letter
          SET content = $2, language = $3, tier = $4
          WHERE id = $1`,
        [id, content, language, tier]
      );
      res.json({
        updated: true
      });
    } catch (err) {
      console.error(err);
      res.json({
        updated: false,
        err
      });
    }
  })
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const word = await pool.query(
        "SELECT * FROM letter WHERE id = $1",
        [id]
      );
      res.json(word.rows[0]);
    } catch (err) {
      console.error(err);
    }
  })
  .delete(async (req, res) => {
    try {
      const { id } = req.params;
      const deletedLetter = await pool.query(
        "DELETE FROM letter WHERE id = $1",
        [id]
      );
      res.json({
        deleted: true,
        data: deletedLetter.rows[0]
      });
    } catch (err) {
      console.error(err);
      res.json({
        deleted: false,
        data: {}
      });
    }
  });

module.exports = router;
