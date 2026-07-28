const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");
const { AppError } = require("../utils/AppError");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildPagination, buildSort, paginationPayload } = require("../utils/query");
const { formatGallery } = require("../services/formatters");

const createGalleryImage = asyncHandler(async (req, res) => {
  let url, publicId;

  if (req.file) {
    // Uploaded via Cloudinary — multer-storage-cloudinary sets path + filename
    url      = req.file.path;
    publicId = req.file.filename;
  } else if (req.body.url) {
    url      = req.body.url;
    publicId = "";
  } else {
    throw new AppError("Gallery image is required.", 400);
  }

  const image = await Gallery.create({ ...req.body, url, publicId });
  res.status(201).json({ success: true, image: formatGallery(image) });
});

const getGalleryImages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (req.query.category)    filter.category    = req.query.category;
  if (req.query.isPublished) filter.isPublished  = req.query.isPublished === "true";
  if (req.query.search)      filter.$text        = { $search: req.query.search };

  const [images, total] = await Promise.all([
    Gallery.find(filter).sort(buildSort(req.query)).skip(skip).limit(limit),
    Gallery.countDocuments(filter),
  ]);

  res.json({
    success: true,
    images: images.map(formatGallery),
    pagination: paginationPayload({ page, limit, total }),
  });
});

const updateGalleryImage = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.file) {
    // Delete old Cloudinary asset if it had one
    const old = await Gallery.findById(req.params.id).select("publicId");
    if (old?.publicId) {
      await cloudinary.uploader.destroy(old.publicId).catch(() => {});
    }
    payload.url      = req.file.path;
    payload.publicId = req.file.filename;
  }

  const image = await Gallery.findByIdAndUpdate(req.params.id, payload, {
    new: true, runValidators: true,
  });
  if (!image) throw new AppError("Gallery image not found.", 404);
  res.json({ success: true, image: formatGallery(image) });
});

const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findByIdAndDelete(req.params.id);
  if (!image) throw new AppError("Gallery image not found.", 404);

  if (image.publicId) {
    await cloudinary.uploader.destroy(image.publicId).catch(() => {});
  }

  res.status(204).send();
});

module.exports = { createGalleryImage, getGalleryImages, updateGalleryImage, deleteGalleryImage };
