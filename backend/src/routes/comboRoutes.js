const express = require("express");
const { query } = require("express-validator");

const { getCombos } = require("../controllers/comboController");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// Public: a guest choosing a table has not signed in yet.
router.get(
  "/",
  query("tableId").optional().isMongoId(),
  query("seats").optional().isInt({ min: 1, max: 40 }),
  validateRequest,
  getCombos
);

module.exports = router;
