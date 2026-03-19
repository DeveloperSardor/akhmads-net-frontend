//src/main.tsx
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { routes } from "./Router";
import "./index.css";

// 🔐 MUHIM: Interceptors ni import qilish (auto token management)
import "./services/interceptors";

import { ThemeProvider } from "next-themes";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={routes} />
      <Toaster position="top-right" />
    </ThemeProvider>
  </HelmetProvider>,
);
