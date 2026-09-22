import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { ProductShowcase } from "@/components/product-showcase";
import { Safety } from "@/components/safety";
import { Faq } from "@/components/faq";
import { CtaBanner } from "@/components/cta-banner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <ProductShowcase />
      <Safety />
      <Faq />
      <CtaBanner />
    </>
  );
}
