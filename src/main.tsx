import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Drop data from the first (daily, single-sound) version so it can't confuse v2.
try {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("noisle:") && !key.startsWith("noisle:v2:")) localStorage.removeItem(key);
  }
} catch {
  /* storage unavailable */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
