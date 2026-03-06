import ConnectedBots from "./components/bots";
import Header from "./components/header";
import HowItWorks from "./components/HowItWorks";
import WhyUs from "./components/WhyUs";

import SEO from "../../components/SEO";
import { useTranslations } from "@/hooks/useTranslations";

const HomePage = () => {
  const t = useTranslations();

  return (
    <>
      <SEO
        title={t.header?.title || "Akhmads Net | Digital Advertising Network"}
        description={
          t.header?.subtitle ||
          "Smart advertising platform that connects advertisers with bot owners."
        }
      />
      <Header />
      <WhyUs />
      <HowItWorks />
      <ConnectedBots />
    </>
  );
};

export default HomePage;
