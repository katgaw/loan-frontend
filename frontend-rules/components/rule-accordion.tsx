"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Rule {
  rule_source: string
  textual_rule: string
  sub_rule_text: string
}

interface RuleAccordionProps {
  rules: Rule[]
}

export default function RuleAccordion({ rules }: RuleAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {rules.map((rule, index) => (
        <AccordionItem key={index} value={`rule-${index}`} className="border-b border-border last:border-b-0 py-2">
          <AccordionTrigger className="hover:no-underline py-4 px-4 rounded-lg hover:bg-muted-light transition-colors">
            <div className="flex items-start gap-3 text-left">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {index + 1}
              </span>
              <span className="font-semibold text-primary text-base leading-snug">{rule.textual_rule}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4 bg-primary/5 rounded-lg mt-2">
            <p className="text-foreground/80 leading-relaxed">{rule.sub_rule_text}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
