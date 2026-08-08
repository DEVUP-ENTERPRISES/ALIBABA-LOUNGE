const Setting = require("../models/Setting");
const { asyncHandler } = require("../utils/asyncHandler");

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  res.json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(req.body);
  } else {
    Object.assign(settings, req.body);
    await settings.save();
  }
  res.json({ success: true, settings });
});

module.exports = {
  getSettings,
  updateSettings,
};
