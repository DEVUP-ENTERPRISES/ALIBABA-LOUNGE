const express = require("express");
const {
  createEvent,
  deleteEvent,
  getEvent,
  getEvents,
  updateEvent,
} = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { eventUpload } = require("../middleware/uploadMiddleware");
const {
  eventIdParam,
  eventPayloadValidator,
  eventUpdateValidator,
} = require("../validators/eventValidator");

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", eventIdParam, validateRequest, getEvent);
router.post("/", protect, eventUpload.single("image"), eventPayloadValidator, validateRequest, createEvent);
router.put("/:id", protect, eventUpload.single("image"), eventUpdateValidator, validateRequest, updateEvent);
router.delete("/:id", protect, eventIdParam, validateRequest, deleteEvent);

module.exports = router;
