const mongoose = require("mongoose");
const { Models } = require("./dbContext");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const schema = new Schema(
  {
    title: String,
    content: String,
    tags: [String],
    user_id: {
      type: Schema.Types.ObjectId,
      alias: "userId",
      default: new ObjectId(),
    },
  },
  { timestamps: true }
);

schema.virtual("comments", {
  ref: Models.TOPIC_COMMENT,
  localField: "_id",
  foreignField: "topic_id",
});

schema.virtual("user", {
  ref: Models.USER,
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model(Models.TOPIC, schema, "topics");
