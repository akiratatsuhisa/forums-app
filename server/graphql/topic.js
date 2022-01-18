const {
  gql,
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
const Topic = require("../models/Topic.model");
const mongoose = require("mongoose");
const { Models } = require("../models/dbContext");
const {
  isOwnedByUser,
  isInRole,
  isAuthenticated,
} = require("../services/Auth.service");

const { ObjectId } = mongoose.Types;

exports.topicSchema = gql`
  type Query {
    topics(limit: Int, cursor: ID): [Topic]
    topic(id: ID!): Topic
  }

  type Mutation {
    createTopic(input: CreateTopicInput!): Topic
    updateTopic(id: ID!, input: UpdateTopicInput!): Topic
    updateTopicStatus(id: ID!, input: UpdateTopicStatusInput): Topic
    deleteTopic(id: ID!): Topic
  }

  input CreateTopicInput {
    title: String!
    content: String!
    tags: [String]!
    forumId: ID!
  }

  input UpdateTopicInput {
    title: String!
    content: String!
    tags: [String]!
  }

  input UpdateTopicStatusInput {
    status: Int!
  }

  type Topic {
    id: ID
    title: String
    content: String
    tags: [String]
    forumId: ID
    forum: Forum
    userId: ID
    user: User
    createdAt: Float
    updatedAt: Float
  }
`;

exports.topicResolvers = {
  Query: {
    topics: async (_, { limit = 10, cursor }) => {
      const filterQuery = {};
      if (cursor) {
        filterQuery["_id"] = {
          $lt: new ObjectId(cursor),
        };
      }
      return await Topic.find(filterQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("user")
        .exec();
    },
    topic: async (_, { id }) => {
      return await Topic.findById(id).populate("user").exec();
    },
  },
  Mutation: {
    createTopic: async (_, { input }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");

        const result = new Topic({
          ...input,
          userId: user.id,
        });
        await result.save();
        return result;
      } catch (error) {
        throw error;
      }
    },
    updateTopic: async (_, { id, input }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (
          !(await isOwnedByUser(user, {
            name: Models.TOPIC,
            id: revokeToken.id,
          }))
        )
          throw new ForbiddenError("Access Denied.");

        const result = await Topic.findByIdAndUpdate(id, { ...input });
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    updateTopicStatus: async (_, { id, input }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (isInRole("admin") || isInRole("moderator"))
          throw new ForbiddenError("Access Denied.");

        const result = await Topic.findByIdAndUpdate(id, { ...input });
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    deleteTopic: async (_, { id }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (
          !(await isOwnedByUser(user, {
            name: Models.TOPIC,
            id: revokeToken.id,
          }))
        )
          throw new ForbiddenError("Access Denied.");

        const result = await Topic.findByIdAndDelete(id);
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
