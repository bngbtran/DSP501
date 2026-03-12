import { createBrowserRouter } from "react-router-dom";
import Layout from "./layout";
import HomePage from "@/pages/HomePage";
import EqPage from "@/pages/EqPage";
import RealtimePage from "@/pages/RealtimePage";
import AnalyzePage from "@/pages/AnalyzePage";
import NotFound from "@/components/common/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "eq", element: <EqPage /> },
      { path: "realtime", element: <RealtimePage /> },
      { path: "analyze", element: <AnalyzePage /> },
      { path: "not-found", element: <NotFound /> },
    ],
  },
]);
