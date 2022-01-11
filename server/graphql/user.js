const { gql, AuthenticationError } = require("apollo-server-express");
const RefreshToken = require("../models/RefreshToken.model");
const User = require("../models/User.model");
const { Models } = require("../models/dbContext");
const {
  generateJwtToken,
  generateRefreshToken,
  revokeRefreshToken,
} = require("../services/User.service");
const { ownedByUser } = require("../services/Auth.service");
const { UserInputError } = require("apollo-server");

exports.userSchema = gql`
  type Query {
    users(limit: Int, cursor: ID, filter: UsersFilter): [User]
    user(id: ID!): User
  }

  type Mutation {
    login(input: LoginInput!): LoginResult
    register(input: RegisterInput!): LoginResult
    refreshToken(input: RefreshTokenInput!): LoginResult
    revokeToken(input: RevokeTokenInput!): LoginResult
  }

  input UsersFilter {
    username: String
  }

  input LoginInput {
    username: String!
    password: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    email: String
    displayName: String
    givenName: String
    familyName: String
  }

  input RefreshTokenInput {
    refreshToken: String!
  }

  input RevokeTokenInput {
    refreshToken: String!
  }

  type LoginResult {
    user: User
    jwtToken: String
    refreshToken: String
  }

  type User {
    username: String
    email: String
    displayName: String
    givenName: String
    familyName: String
    roles: [String]
  }
`;

exports.userResolvers = {
  Query: {
    users: async (_, { limit = 10, skip = 0, filter }) => {
      const filterQuery = {};
      if (filter.username) {
        filterQuery.username = `/.*${filter.username.trim()}.*/i`;
      }
      return await User.find(filterQuery).skip(skip).limit(limit);
    },
    user: async (_, { id }) => {
      return await User.findById(id);
    },
  },
  Mutation: {
    login: async (_, { input }) => {
      const { username, password } = input;
      try {
        const user = await User.findOne({ username });
        if (!user?.comparePassword(password)) {
          throw new UserInputError("Email or password is incorrect.");
        }

        const jwtToken = generateJwtToken(user);
        const refreshToken = await generateRefreshToken(user);

        return {
          user,
          jwtToken,
          refreshToken,
        };
      } catch (error) {
        throw error;
      }
    },
    register: async (_, { input }) => {
      const { username, password, email, displayName, givenName, familyName } =
        input;
      try {
        const user = new User({
          username,
          email,
          displayName,
          givenName,
          familyName,
          roles: ["user"],
        });
        user.password = await User.hashPassword(password);
        await user.save();

        const jwtToken = generateJwtToken(user);
        const refreshToken = await generateRefreshToken(user);

        return {
          user,
          jwtToken,
          refreshToken,
        };
      } catch (error) {
        if (error.code === 11000) throw new UserInputError("Register failed.");
        else throw error;
      }
    },
    refreshToken: async (_, { input }) => {
      try {
        const revokeToken = await RefreshToken.findOne({
          value: input.refreshToken,
        });
        if (
          revokeToken?.expires < Date.now() ||
          revokeToken.revokedAt ||
          revokeToken.replacedBy
        )
          throw new UserInputError("Invalid token");

        const user = await User.findById(revokeToken.userId);
        if (!user) {
          throw new Error("User is not exists.");
        }
        await ownedByUser(user, {
          name: Models.REFRESH_TOKEN,
          id: revokeToken.id,
        });

        const jwtToken = generateJwtToken(user);
        const refreshToken = await generateRefreshToken(user);
        await revokeRefreshToken(revokeToken.value, {
          replacedBy: refreshToken.id,
        });
        return {
          user,
          jwtToken,
          refreshToken,
        };
      } catch (error) {
        throw error;
      }
    },
    revokeToken: async (_, { input }, { user }) => {
      try {
        const revokeToken = await RefreshToken.findOne({
          value: input.refreshToken,
        });
        if (!revokeToken) throw new UserInputError("Invalid token");
        await ownedByUser(user, {
          name: Models.REFRESH_TOKEN,
          id: revokeToken.id,
        });

        const result = await revokeRefreshToken(revokeToken.value);

        return {
          user: null,
          jwtToken: null,
          refreshToken: result,
        };
      } catch (error) {
        throw error;
      }
    },
  },
};
