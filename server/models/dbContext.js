const mongoose = require("mongoose");

const connectionString = process.env.CONNECTION_STRING;

exports.Models = {
  USER: "User",
  REFRESH_TOKEN: "RefreshToken",
  FORUM: "Forum",
  TOPIC: "Topic",
  TOPIC_COMMENT: "TopicComment",
};

exports.connectDatabase = async () => {
  await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.info("connection connected");

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));

  //Models require
  require("./User.model");
  require("./RefreshToken.model");
  require("./Forum.model");
  require("./Topic.model");
  require("./TopicComment.model");

  return db;
};
