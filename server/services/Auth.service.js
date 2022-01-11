const mongoose = require("mongoose");
const { AuthenticationError, ForbiddenError } = require("apollo-server");

exports.authorize = (user, roles = []) => {
  if (!user) throw new AuthenticationError("Not Authenticated");
  if (
    roles.length &&
    !user?.roles?.some((userRole) => roles.includes(userRole))
  )
    throw new AuthenticationError("Access Denied");
};

exports.ownedByUser = async (user, model) => {
  const { name, id } = model;
  if (!user) throw new AuthenticationError("Not Authenticated");

  const cursor = await mongoose.model(name).findById(id);
  if (cursor?.userId != user.id) throw new ForbiddenError("Access Denied");
};
