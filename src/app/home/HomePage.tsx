import ConnectedBots from "./components/bots";
import Header from "./components/header"
import HowItWorks from "./components/HowItWorks";
import WhyUs from "./components/WhyUs"

const HomePage = () => {
  return (
    <>
      <Header />
      <WhyUs />
      <HowItWorks />
      <ConnectedBots/>
    </>
  );
}

export default HomePage