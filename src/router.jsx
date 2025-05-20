import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { Face } from "./pages/Face";
import { Arm } from "./pages/Arm";
import { Result } from "./pages/Result";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
    path: "/result",
    element: <Result />,
  },
]);
