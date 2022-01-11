import {
  ApolloClient,
  InMemoryCache,
  split,
  HttpLink,
  gql,
  concat,
  ApolloLink,
  fromPromise,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      jwtToken
      refreshToken
    }
  }
`;

export const getTokens = () => {
  const accessToken = localStorage.getItem("access-token");
  const refreshToken = localStorage.getItem("refresh-token");

  return {
    jwtToken: accessToken,
    refreshToken: refreshToken,
  };
};

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access-token", accessToken);
  localStorage.setItem("refresh-token", refreshToken);
};

export const removeTokens = () => {
  localStorage.removeItem("access-token");
  localStorage.removeItem("refresh-token");
};

export const refreshTokenHandle = () => {
  const { refreshToken } = getTokens();
  return apolloClient
    .mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { $input: { refreshToken } },
    })
    .then((response) => {
      const { data } = response;
      return { jwtToken: data.jwtToken, refreshToken: data.refreshToken };
    });
};

//Init
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    reconnect: true,
  },
});
wsLink.subscriptionClient.onReconnected(() => console.log("Reconnected"));

//error middleware
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        switch (err.extensions.code) {
          case "UNAUTHENTICATED":
            return fromPromise(
              refreshTokenHandle().catch((error) => {
                removeTokens();
                return;
              })
            )
              .filter((value) => Boolean(value))
              .flatMap(({ jwtToken, refreshToken }) => {
                setTokens(jwtToken, refreshToken);
                const oldHeaders = operation.getContext().headers;

                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: `Bearer ${jwtToken}`,
                  },
                });

                return forward(operation);
              });
          default:
        }
      }
    }
    if (networkError) {
      console.log(`[Network error]: ${networkError}`);
    }
  }
);

//http middleware
const authMiddleware = new ApolloLink((operation, forward) => {
  operation.setContext(({ headers = {} }) => {
    const { jwtToken } = getTokens();

    return {
      headers: {
        ...headers,
        authorization: jwtToken ? `Bearer ${jwtToken}` : "",
      },
    };
  });

  return forward(operation);
});

//websocket middlewares
wsLink.subscriptionClient.use([
  {
    applyMiddleware: async (options, next) => {
      const { jwtToken } = getTokens();

      options.context = {
        authorization: jwtToken ? `Bearer ${jwtToken}` : "",
      };
      next();
    },
  },
]);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: concat(concat(authMiddleware, splitLink), errorLink),
  cache: new InMemoryCache(),
  //refresh query after history push
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
    },
    query: {
      fetchPolicy: "network-only",
    },
  },
});
