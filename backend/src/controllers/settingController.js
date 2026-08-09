const Setting = require("../models/Setting");
const { asyncHandler } = require("../utils/asyncHandler");
const { SETTING_FIELDS } = require("../validators/settingValidator");

// Copy only known setting fields — never assign req.body wholesale.
function pickSettingFields(body) {
  const updates = {};
  for (const field of SETTING_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  return updates;
}

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  res.json({ success: true, settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const updates = pickSettingFields(req.body);

  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }
  res.json({ success: true, settings });
});

module.exports = {
  getSettings,
  updateSettings,
};
