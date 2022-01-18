const { gql, AuthenticationError, ForbiddenError } = require("apollo-server-express");
const Forum = require("../models/Forum.model");
const mongoose = require("mongoose");
const { isAuthenticated, isInRole } = require("../services/Auth.service");

const { ObjectId } = mongoose.Types;

exports.forumSchema = gql`
  type Query {
    forums(limit: Int, cursor: ID): [Forum]
    forum(id: ID!): Forum
  }

  type Mutation {
    createForum(input: CreateForumInput!): Forum
    updateForum(id: ID!, input: UpdateForumInput!): Forum
    deleteForum(id: ID!): Forum
  }

  input CreateForumInput {
    title: String!
    description: String
    group: Int
 }

  input UpdateForumInput {
    title: String!
    description: String
    group: Int
 }

  type Forum {
    id: ID
    title: String
    description: String
    group: Int
  }
`;

exports.forumResolvers = {
  Query: {
    forums: async (_, { limit = 10, cursor }) => {
      const filterQuery = {};
      if (cursor) {
        filterQuery["_id"] = {
          $lt: new ObjectId(cursor),
        };
      }
      return await Forum.find(filterQuery).limit(limit);
    },
    forum: async (_, { id }) => {
      return await Forum.findById(id);
    },
  },
  Mutation: {
    createForum: async (_, { input }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (!isInRole(user, "admin"))
          throw new ForbiddenError("Access Denied");

        const result = new Forum({
          ...input,
        });
        await result.save();
        return result;
      } catch (error) {
        throw error;
      }
    },
    updateForum: async (_, { id, input }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (!isInRole(user, "admin"))
          throw new ForbiddenError("Access Denied");

        const result = await Forum.findByIdAndUpdate(id, { ...input });
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    deleteForum: async (_, { id }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (!isInRole(user, "admin"))
          throw new ForbiddenError("Access Denied");

        const result = await Forum.findByIdAndDelete(id);
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
