const { gql } = require("apollo-server-express");
const Topic = require("../models/Topic.model");
const mongoose = require("mongoose");
const { Models } = require("../models/dbContext");
const { ownedByUser, authorize } = require("../services/Auth.service");

const { ObjectId } = mongoose.Types;

exports.topicSchema = gql`
  type Query {
    topics(limit: Int, cursor: ID): [Topic]
    topic(id: ID!): Topic
  }

  type Mutation {
    createTopic(input: CreateTopicInput!): Topic
    updateTopic(id: ID!, input: UpdateTopicInput!): Topic
    deleteTopic(id: ID!): Topic
  }

  input CreateTopicInput {
    title: String!
    content: String!
    tags: [String]!
  }

  input UpdateTopicInput {
    title: String!
    content: String!
    tags: [String]!
  }

  type Topic {
    id: ID
    title: String
    content: String
    tags: [String]
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
        authorize(user);

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
        await ownedByUser(user, { name: Models.TOPIC, id });

        const result = await Topic.findByIdAndUpdate(id, { ...input });
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    deleteTopic: async (_, { id }, { user }) => {
      try {
        await ownedByUser(user, { name: Models.TOPIC, id });

        const result = await Topic.findByIdAndDelete(id);
        return result;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },
};
