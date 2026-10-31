import { Hero } from "@/components/home/Hero";
import { Closing, Numbers, Portals, Proof, Ticker, TwoLayers } from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Numbers />
      <TwoLayers />
      <Portals />
      <Proof />
      <Closing />
    </>
  );
}
