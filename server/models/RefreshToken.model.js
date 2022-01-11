const mongoose = require("mongoose");
const { Models } = require("./dbContext");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const schema = new Schema(
  {
    value: { type: String, required: true },
    user_id: {
      type: Schema.Types.ObjectId,
      alias: "userId",
      default: new ObjectId(),
    },
    expires: { type: Date, default: () => new Date() },
    replacedBy: { type: Schema.Types.ObjectId, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

schema.virtual("user", {
  ref: Models.USER,
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model(Models.REFRESH_TOKEN, schema, "refreshTokens");
