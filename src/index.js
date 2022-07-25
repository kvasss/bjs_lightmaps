import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Scene3d from "./Scene3d";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Scene3d />
  </StrictMode>
);
