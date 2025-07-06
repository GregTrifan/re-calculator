import * as React from "react";
import { createRoot } from "react-dom/client";
import "./index.css"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ReRxManager from "./ReRxManager";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ReRxManager />
    ),
  }, 
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
