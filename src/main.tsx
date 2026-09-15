import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeUpdate", ({ updates }) => {
    const hasCodeUpdate = updates.some((update) => update.type === "js-update");

    if (hasCodeUpdate) {
      // React Fast Refresh preserves hook refs, including the running Phaser.Game.
      // Recreate the page automatically so scenes, level data and physics use the
      // newly saved modules. Styles keep Vite's normal in-place HMR behavior.
      window.location.reload();
    }
  });
}
