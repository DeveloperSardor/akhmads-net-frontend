import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { Outlet } from "react-router-dom";

import dayjs from "dayjs";
import "dayjs/locale/en";
import updateLocale from "dayjs/plugin/updateLocale";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import "dayjs/locale/en";
import { ScrollToTop } from "@/lib/ScrollToTop";

dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  weekStart: 1,
});
dayjs.locale("en");

function MainLayout() {
  return (
    <ConfigProvider
      locale={enUS}
      theme={{
        token: { colorPrimary: "#1AA4FF" },
        components: {
          DatePicker: {
            hoverBorderColor: "none",
            hoverBg: "none",
            activeBorderColor: "none",
            activeBg: "none",
            activeShadow: "none",
          },
        },
      }}
    >
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </ConfigProvider>
  );
}

export default MainLayout;