"use client";

import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@instanct/ui/components/accordion";
import { faqKeys } from "@/lib/site";

export function Faq() {
  const { t } = useTranslation("landing");

  return (
    <section id="faq" className="scroll-mt-24 border-t">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">{t("faq.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("faq.title")}
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {faqKeys.map((key) => (
            <AccordionItem key={key} value={key}>
              <AccordionTrigger className="text-base">
                {t(`faq.items.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {t(`faq.items.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
