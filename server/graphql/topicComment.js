const {
  gql,
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
const { withFilter } = require("graphql-subscriptions");
const mongoose = require("mongoose");

const TopicComment = require("../models/TopicComment.model");
const { Models } = require("../models/dbContext");
const {
  isOwnedByUser,
  isInRole,
  isAuthenticated,
} = require("../services/Auth.service");

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
    updateTopicCommentStatus(
      id: ID!
      input: UpdateTopicCommentStatusInput!
    ): TopicComment
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

  input UpdateTopicCommentStatusInput {
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
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");

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
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (
          !(await isOwnedByUser(user, {
            name: Models.TOPIC_COMMENT,
            id: revokeToken.id,
          }))
        )
          throw new ForbiddenError("Access Denied.");

        const result = await TopicComment.findByIdAndUpdate(id, {
          ...input,
        }).populate("topic");
        return result;
      } catch (error) {
        throw error;
      }
    },
    updateTopicCommentStatus: async (_, { id, input }, { user }) => {
      try {
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (isInRole("admin") || isInRole("moderator"))
          throw new ForbiddenError("Access Denied.");

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
        if (!isAuthenticated(user))
          throw new AuthenticationError("Unauthenticated");
        if (
          !(await isOwnedByUser(user, {
            name: Models.TOPIC_COMMENT,
            id: revokeToken.id,
          }))
        )
          throw new ForbiddenError("Access Denied.");

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
