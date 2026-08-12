const express = require("express");
const { body } = require("express-validator");

const { getSuggestions } = require("../controllers/suggestionController");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

// Public: the cart is not sensitive and guests order without signing in.
router.post(
  "/",
  body("itemIds").isArray({ max: 30 }),
  body("itemIds.*").isMongoId(),
  validateRequest,
  getSuggestions
);

module.exports = router;
