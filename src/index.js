import React from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import ChatProvider from "./Context/ChatProvider";
import { BrowserRouter } from "react-router-dom";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const apiBaseUrl = process.env.REACT_APP_API_URL?.trim();
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl.replace(/\/+$/, "");
}

const theme = extendTheme({ config });

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <BrowserRouter>
      <ChatProvider>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChatProvider>
    </BrowserRouter>
  </ChakraProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
