const router = require('express').Router();
const pool = require('../db/db');

router
  .route("/")
  .post(async (req, res) => {
    try {
      const { code } = req.body;
      const newCode = await pool.query(
        "INSERT INTO language(code) VALUES($1)",
        [code]
      );

      res.json(newCode);
    } catch (err) {
      console.error(err);
    }
  })
  .get(async (req, res) => {
    try {
      const allLang = await pool.query("SELECT * FROM language");
      res.json(allLang.rows);
    } catch (err) {
      console.err(err);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const { id } = req.params;
      const lang = await pool.query("SELECT * FROM language WHERE code = $1", [
        id
      ]);
      res.json(lang.rows);
    } catch (err) {
      console.error(err);
    }
  })
  .put(async (req, res) => {
    try {
      const { id } = req.params;
      const { code } = req.body;
      const newCode = await pool.query(
        "UPDATE language SET code = $1 WHERE code = $2",
        [code, id]
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
      const deletedLang = await pool.query(
        "DELETE FROM language WHERE code = $1",
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
