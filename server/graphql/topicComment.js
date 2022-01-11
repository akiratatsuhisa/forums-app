const { gql } = require("apollo-server-express");
const { withFilter } = require("graphql-subscriptions");
const mongoose = require("mongoose");

const TopicComment = require("../models/TopicComment.model");
const { Models } = require("../models/dbContext");
const { ownedByUser, authorize } = require("../services/Auth.service");

const { ObjectId } = mongoose.Types;

exports.topicCommentSchema = gql`
  type Query {
    topicComments(
      cursor: ID
      limit: Int
      filter: TopicCommentsFilter
    ): [TopicComment]
    topicComment(id: ID!): TopicComment
  }

  type Mutation {
    createTopicComment(input: CreateTopicCommentInput!): TopicComment
    updateTopicComment(id: ID!, input: UpdateTopicCommentInput!): TopicComment
    deleteTopicComment(id: ID!): TopicComment
  }

  type Subscription {
    createdTopicComment(topicId: ID!): TopicComment
    deletedTopicComment(topicId: ID!): TopicComment
  }

  input TopicCommentsFilter {
    topicId: ID
  }

  input CreateTopicCommentInput {
    content: String!
    topicId: ID!
  }

  input UpdateTopicCommentInput {
    content: String!
    topicId: ID!
  }

  type TopicComment {
    id: ID
    content: String
    topicId: ID
    topic: Topic
    userId: ID
    user: User
    createdAt: Float
    updatedAt: Float
  }
`;

exports.topicCommentResolvers = {
  Query: {
    topicComments: async (_, { limit = 10, cursor, filter }) => {
      const filterQuery = {};
      if (filter) {
        filterQuery["topic_id"] = filter.topicId;
      }
      if (cursor) {
        filterQuery["_id"] = {
          $lt: new ObjectId(cursor),
        };
      }

      const result = await TopicComment.find(filterQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("topic")
        .populate("user")
        .exec();
      return result;
    },
    topicComment: async (_, { id }) => {
      return await TopicComment.findById(id)
        .populate("topic")
        .populate("user")
        .exec();
    },
  },
  Mutation: {
    createTopicComment: async (_, { input }, { user, pubsub }) => {
      try {
        authorize(user);

        const result = await (
          await new TopicComment({
            ...input,
            userId: user.id,
          }).save()
        ).populate("topic");
        pubsub.publish("CREATED_COMMENT", {
          createdTopicComment: result,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    updateTopicComment: async (_, { id, input }, { user }) => {
      try {
        await ownedByUser(user, { name: Models.TOPIC_COMMENT, id });

        const result = await TopicComment.findByIdAndUpdate(id, {
          ...input,
        }).populate("topic");
        return result;
      } catch (error) {
        throw error;
      }
    },
    deleteTopicComment: async (_, { id }, { user, pubsub }) => {
      try {
        await ownedByUser(user, { name: Models.TOPIC_COMMENT, id });

        const result = await TopicComment.findByIdAndDelete(id).populate(
          "topic"
        );
        pubsub.publish("DELETED_COMMENT", {
          deletedTopicComment: result,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
  },
  Subscription: {
    createdTopicComment: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(["CREATED_COMMENT"]),
        ({ createdTopicComment }, { topicId }) => {
          return createdTopicComment.topicId == topicId;
        }
      ),
    },
    deletedTopicComment: {
      subscribe: withFilter(
        (_, __, { pubsub }) => pubsub.asyncIterator(["DELETED_COMMENT"]),
        ({ deletedTopicComment }, { topicId }) => {
          return deletedTopicComment.topicId == topicId;
        }
      ),
    },
  },
};
