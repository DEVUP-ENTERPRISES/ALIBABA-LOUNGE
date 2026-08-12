const mongoose = require("mongoose");

/**
 * Atomic sequence numbers.
 *
 * Order numbers used to be "read the highest, add one", which is a race: two
 * guests ordering in the same instant both read the same value, both try to
 * insert it, and one gets a duplicate-key error surfaced as a 500. A single
 * $inc under findOneAndUpdate is atomic in MongoDB, so every caller gets a
 * distinct number no matter how many arrive together.
 */
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: Number, required: true, default: 0 },
});

counterSchema.statics.next = async function next(name, startAt = 0) {
  const doc = await this.findByIdAndUpdate(
    name,
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc.value + startAt;
};

module.exports = mongoose.model("Counter", counterSchema);
