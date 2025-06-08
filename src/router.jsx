import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import { Face } from "./pages/Face";
import { Arm } from "./pages/Arm";
import { Voice } from "./pages/Voice";
import { Result } from "./pages/Result";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/face",
    element: <Face />,
  },
  {
    path: "/arm",
    element: <Arm />,
  },
  {
    path: "/voice",
    element: <Voice />,
  },
  {
    path: "/result",
    element: <Result />,
  },
]);
