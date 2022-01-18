const mongoose = require("mongoose");

exports.isAuthenticated = (user) => {
  return user != null;
};

exports.isInRole = (user, role = "") => {
  return user?.roles?.includes(role);
};

exports.isOwnedByUser = async (user, model) => {
  const { name, id } = model;
  const cursor = await mongoose.model(name).findById(id);
  return cursor?.userId != user.id;
};
