const CateringInquiry = require("../models/CateringInquiry");
const FranchiseApplication = require("../models/FranchiseApplication");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, buildSort, paginationPayload } = require("../utils/query");
const { formatInquiry } = require("../services/formatters");

function listInquiries(Model) {
  return asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.$text = { $search: req.query.search };

    const [items, total] = await Promise.all([
      Model.find(filter).sort(buildSort(req.query)).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);

    res.json({
      success: true,
      inquiries: items.map(formatInquiry),
      applications: items.map(formatInquiry),
      pagination: paginationPayload({ page, limit, total }),
    });
  });
}

function updateInquiry(Model, notFoundMessage) {
  return asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) throw new AppError(notFoundMessage, 404);
    res.json({ success: true, inquiry: formatInquiry(item), application: formatInquiry(item) });
  });
}

function deleteInquiry(Model, notFoundMessage) {
  return asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) throw new AppError(notFoundMessage, 404);
    res.status(204).send();
  });
}

const createCateringInquiry = asyncHandler(async (req, res) => {
  const inquiry = await CateringInquiry.create(req.body);
  res.status(201).json({ success: true, inquiry: formatInquiry(inquiry) });
});

const createFranchiseApplication = asyncHandler(async (req, res) => {
  const name = req.body.name || [req.body.firstName, req.body.lastName].filter(Boolean).join(" ");
  const application = await FranchiseApplication.create({ ...req.body, name });
  res.status(201).json({ success: true, application: formatInquiry(application) });
});

module.exports = {
  createCateringInquiry,
  listCateringInquiries: listInquiries(CateringInquiry),
  updateCateringInquiry: updateInquiry(CateringInquiry, "Catering inquiry not found."),
  deleteCateringInquiry: deleteInquiry(CateringInquiry, "Catering inquiry not found."),
  createFranchiseApplication,
  listFranchiseApplications: listInquiries(FranchiseApplication),
  updateFranchiseApplication: updateInquiry(FranchiseApplication, "Franchise application not found."),
  deleteFranchiseApplication: deleteInquiry(FranchiseApplication, "Franchise application not found."),
};
