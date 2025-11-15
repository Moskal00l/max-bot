import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import '@maxhub/max-ui/dist/styles.css';
import { MaxUI } from "@maxhub/max-ui";
import "./index.css";
import App from "./App.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MaxUI className="max-ui">
      <App />
    </MaxUI>
  </StrictMode>
);
