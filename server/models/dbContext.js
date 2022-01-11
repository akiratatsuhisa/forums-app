const mongoose = require("mongoose");

const connectionString = process.env.CONNECTION_STRING;

exports.Models = {
  USER: "User",
  TOPIC: "Topic",
  TOPIC_COMMENT: "TopicComment",
  REFRESH_TOKEN: "RefreshToken",
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
  require("./Topic.model");
  require("./TopicComment.model");
  require("./RefreshToken.model");

  return db;
};
