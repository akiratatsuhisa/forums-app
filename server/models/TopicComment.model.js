const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const { Models } = require("./dbContext");

const schema = new Schema(
  {
    content: { type: String, required: true },
    status: { type: Number, required: true, default: 0 },
    topic_id: { type: Schema.Types.ObjectId, alias: "topicId" },
    user_id: {
      type: Schema.Types.ObjectId,
      alias: "userId",
      default: new ObjectId(),
    },
  },
  { timestamps: true }
);

schema.virtual("topic", {
  ref: Models.TOPIC,
  localField: "topic_id",
  foreignField: "_id",
  justOne: true,
});

schema.virtual("user", {
  ref: Models.USER,
  localField: "user_id",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model(Models.TOPIC_COMMENT, schema, "topicComments");
