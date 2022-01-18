const { gql } = require("apollo-server-express");
const { withFilter } = require("graphql-subscriptions");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const { userSchema, userResolvers } = require("./user");
const { forumSchema, forumResolvers } = require("./forum");
const { topicSchema, topicResolvers } = require("./topic");
const { topicCommentSchema, topicCommentResolvers } = require("./topicComment");

const defaultSchema = gql`
  type Query {
    hello: String
  }
`;

const defaultResolvers = {
  Query: {
    hello: (obj, args, context, info) => {
      return "hello world";
    },
  },
};

const typeDefs = [
  defaultSchema,
  userSchema,
  forumSchema,
  topicSchema,
  topicCommentSchema,
];
const resolvers = [
  defaultResolvers,
  userResolvers,
  forumResolvers,
  topicResolvers,
  topicCommentResolvers,
];

exports.schema = makeExecutableSchema({ typeDefs, resolvers });
