import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import "bootstrap-icons/font/bootstrap-icons.css";

import reportWebVitals from "./reportWebVitals";
import { ApolloProvider } from "@apollo/client";
import App from "./App";
import { apolloClient } from "./Services/graphql";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
