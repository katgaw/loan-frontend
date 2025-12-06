"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface GroupedRule {
  textual_rule: string
  sub_rules: string[]
}

interface DUSSection {
  DUS_section: string
  DUS_summary: string
  rules: GroupedRule[]
}

interface RuleAccordionProps {
  sections: DUSSection[]
}

export default function RuleAccordion({ sections }: RuleAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {sections.map((section, sectionIndex) => (
        <AccordionItem 
          key={section.DUS_section} 
          value={`section-${section.DUS_section}`} 
          className="border-b border-border last:border-b-0 py-2"
        >
          <AccordionTrigger className="hover:no-underline py-4 px-4 rounded-lg hover:bg-muted-light transition-colors">
            <div className="flex items-start gap-3 text-left">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {section.DUS_section}
              </span>
              <div className="flex-1">
                <div className="font-semibold text-primary text-base leading-snug mb-1">
                  Section {section.DUS_section}
                </div>
                <div className="text-sm text-muted-foreground">
                  {section.DUS_summary}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-4">
            <div className="space-y-4">
              {section.rules.map((rule, ruleIndex) => (
                <div key={ruleIndex} className="border-l-2 border-primary/30 pl-4">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`rule-${ruleIndex}`} className="border-none">
                      <AccordionTrigger className="hover:no-underline py-2 px-2 rounded-md hover:bg-primary/5 transition-colors">
                        <div className="flex items-start gap-2 text-left">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center text-white text-xs font-bold">
                            {ruleIndex + 1}
                          </span>
                          <span className="font-medium text-foreground text-sm leading-snug">{rule.textual_rule}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 py-3 bg-primary/5 rounded-lg mt-2 ml-8">
                        {rule.sub_rules.length === 1 ? (
                          <p className="text-foreground/80 leading-relaxed text-sm">{rule.sub_rules[0]}</p>
                        ) : (
                          <ul className="space-y-2">
                            {rule.sub_rules.map((subRule, subIndex) => (
                              <li key={subIndex} className="flex items-start gap-2">
                                <span className="text-primary font-bold mt-1 text-sm">•</span>
                                <span className="text-foreground/80 leading-relaxed flex-1 text-sm">{subRule}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
