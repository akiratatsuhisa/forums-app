const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const { Models } = require("./dbContext");

const schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, trim: true },
  password: { type: String, required: true },
  displayName: { type: String },
  givenName: { type: String },
  familyName: { type: String },
  roles: {
    type: [String],
    enum: ["admin", "moderator", "user"],
  },
});

schema.virtual("comments", {
  ref: Models.TOPIC_COMMENT,
  localField: "user_id",
  foreignField: "_id",
});

schema.virtual("topics", {
  ref: Models.TOPIC,
  localField: "user_id",
  foreignField: "_id",
});

schema.virtual("topics", {
  ref: Models.REFRESH_TOKEN,
  localField: "user_id",
  foreignField: "_id",
});

schema.methods.hashPassword = async function (password) {
  this.password = await bcrypt.hash(password, 10);
};

schema.methods.comparePassword = async function (password) {
  if (password?.length === 0) return false;
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model(Models.USER, schema, "users");
