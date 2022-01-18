const { createServer } = require("http");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { execute, subscribe } = require("graphql");

const { PubSub } = require("graphql-subscriptions");

const { ApolloServer } = require("apollo-server-express");
const { SubscriptionServer } = require("subscriptions-transport-ws");

const { schema } = require("./graphql/");
const { connectDatabase } = require("./models/dbContext");
const { validateJwtToken } = require("./services/User.service");

(async (schema) => {
  const dbContext = await connectDatabase();

  const PORT = process.env.PORT || 4000;
  const app = express();
  const httpServer = createServer(app);

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // static folder /public
  app.use(express.static(path.join(__dirname, "public")));

  // create instance graphql-subcription
  const pubsub = new PubSub();

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => {
      //get auth info from http headers middleware client/src/Services/graphql.js
      const token = req.headers.authorization;
      const user = validateJwtToken(token);

      //inject pubsub auth info into context
      return {
        pubsub,
        user,
      };
    },
  });
  await server.start();
  server.applyMiddleware({ app });

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onOperation: (message, params) => {
        //get auth info from http headers middleware client/src/Services/graphql.js
        const token = message.payload.context.authorization;
        const user = validateJwtToken(token);

        //inject pubsub auth info into context
        return { ...params, context: { user, pubsub } };
      },
    },
    { server: httpServer, path: server.graphqlPath }
  );

  httpServer.listen(PORT, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
})(schema);
