const mongoose = require("mongoose");
const { Models } = require("./dbContext");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    status: { type: Number, required: true, default: 0 },
    tags: [String],
    user_id: {
      type: Schema.Types.ObjectId,
      alias: "userId",
      default: new ObjectId(),
    },
    forum_id: {
      type: Schema.Types.ObjectId,
      alias: "forumId",
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

schema.virtual("forum", {
  ref: Models.FORUM,
  localField: "forum_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model(Models.TOPIC, schema, "topics");
