import { createBrowserRouter } from "react-router-dom";
import NavigatePage from "./middlewares/NavigatePage";
import ChekLang from "./lib/CheckLang";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Home } from "./app";
import AddBot from "./app/AddBot/addbot";
import BotSettings from "./app/bot-settings/BotSettings";
import Wallet from "./app/wallet/wallet";
import Faq from "./app/faq/Faq";
import Login from "./app/login/login";
import Profile from "./app/profile/profile";
// ✅ NEW IMPORTS
import LaunchAd from "./app/ads/LaunchAd";
import MyAds from "./app/ads/MyAds";
import AdDetails from "./app/ads/AdDetails";
import BroadcastAd from "./app/ads/BroadcastAd";
import AdminPanel from "./app/admin/AdminPanel";
import ModerationPage from "./app/moderation/ModerationPage";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <NavigatePage />,
  },
  {
    path: "/:lang",
    element: <ChekLang />,
    children: [
      // 🔓 LOGIN PAGE (without Navbar)
      {
        path: "login",
        element: <Login />,
      },

      // 🌟 PUBLIC HOME with Navbar (no auth required)
      {
        path: "",
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "faq",
            element: <Faq />,
          },
        ],
      },

      // 🔐 PROTECTED ROUTES with Navbar (auth required)
      {
        path: "",
        element: <MainLayout />,
        children: [
          {
            path: "add-bot",
            element: (
              <ProtectedRoute>
                <AddBot />
              </ProtectedRoute>
            ),
          },
          {
            path: "bots/:botId/settings",
            element: (
              <ProtectedRoute>
                <BotSettings />
              </ProtectedRoute>
            ),
          },
          // ✅ NEW ROUTES - Launch Ad System
          {
            path: "launch-ad",
            element: (
              <ProtectedRoute>
                <LaunchAd />
              </ProtectedRoute>
            ),
          },
          {
            path: "my-ads",
            element: (
              <ProtectedRoute>
                <MyAds />
              </ProtectedRoute>
            ),
          },
          {
            path: "ads/:adId",
            element: (
              <ProtectedRoute>
                <AdDetails />
              </ProtectedRoute>
            ),
          },
          {
            path: "broadcasts/new",
            element: (
              <ProtectedRoute>
                <BroadcastAd />
              </ProtectedRoute>
            ),
          },
          {
            path: "moderation",
            element: (
              <ProtectedRoute>
                <ModerationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "wallet",
            element: (
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            ),
          },
          {
            path: "profile",
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin",
            element: (
              <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                <AdminPanel />
              </ProtectedRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl">Page not found</p>
        </div>
      </div>
    ),
  },
]);
