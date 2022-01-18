const mongoose = require("mongoose");
const { Models } = require("./dbContext");
const { Schema } = mongoose;

const schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  group: { type: Number, required: true },
});

schema.virtual("topics", {
  ref: Models.TOPIC,
  localField: "_id",
  foreignField: "forum_id",
});

module.exports = mongoose.model(Models.FORUM, schema, "forums");
