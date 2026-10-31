import { Hero } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { Closing, Numbers, Portals, Proof, Ticker, TwoLayers } from "@/components/home/Sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Journey />
      <Numbers />
      <TwoLayers />
      <Portals />
      <Proof />
      <Closing />
    </>
  );
}
