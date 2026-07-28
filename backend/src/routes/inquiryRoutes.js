const express = require("express");
const {
  createCateringInquiry,
  createFranchiseApplication,
  deleteCateringInquiry,
  deleteFranchiseApplication,
  listCateringInquiries,
  listFranchiseApplications,
  updateCateringInquiry,
  updateFranchiseApplication,
} = require("../controllers/inquiryController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const {
  cateringCreateValidator,
  franchiseCreateValidator,
  inquiryIdParam,
  inquiryUpdateValidator,
} = require("../validators/inquiryValidator");

const router = express.Router();

router.post("/catering", cateringCreateValidator, validateRequest, createCateringInquiry);
router.get("/catering", protect, listCateringInquiries);
router.put("/catering/:id", protect, inquiryUpdateValidator, validateRequest, updateCateringInquiry);
router.delete("/catering/:id", protect, inquiryIdParam, validateRequest, deleteCateringInquiry);

router.post("/franchise", franchiseCreateValidator, validateRequest, createFranchiseApplication);
router.get("/franchise", protect, listFranchiseApplications);
router.put("/franchise/:id", protect, inquiryUpdateValidator, validateRequest, updateFranchiseApplication);
router.delete("/franchise/:id", protect, inquiryIdParam, validateRequest, deleteFranchiseApplication);

module.exports = router;
