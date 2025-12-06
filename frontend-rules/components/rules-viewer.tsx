"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RuleAccordion from "./rule-accordion"
import { CheckCircle2, TrendingUp, Settings } from "lucide-react"

interface Rule {
  rule_source: string
  textual_rule: string
  sub_rule_text: string
}

const TAB_MAPPINGS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  "Income & Expenses": {
    label: "Income & Expenses",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "from-primary to-primary/70",
  },
  Valuation: {
    label: "Valuation",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "from-primary/80 to-primary/60",
  },
  "Management & Exit": {
    label: "Management & Exit",
    icon: <Settings className="w-4 h-4" />,
    color: "from-primary/90 to-primary/70",
  },
}

export default function RulesViewer() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("Income & Expenses")

  useEffect(() => {
    const loadRules = async () => {
      try {
        const response = await fetch("/rules.csv")
        const csvText = await response.text()

        // Dynamically import Papa Parse
        const Papa = (await import("papaparse")).default

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: { data: Rule[] }) => {
            setRules(results.data)
            setLoading(false)
          },
          error: (error: Error) => {
            setError(`Failed to parse CSV: ${error.message}`)
            setLoading(false)
          },
        })
      } catch (err) {
        setError("Failed to load rules file")
        setLoading(false)
      }
    }

    loadRules()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mb-4"></div>
          <p className="text-muted-foreground">Loading surveillance rules...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error/30 bg-error/10 p-6">
        <p className="text-error font-medium">⚠️ {error}</p>
      </div>
    )
  }

  const groupedRules = rules.reduce(
    (acc, rule) => {
      const source = rule.rule_source || "Unknown"
      if (!acc[source]) {
        acc[source] = []
      }
      acc[source].push(rule)
      return acc
    },
    {} as Record<string, Rule[]>,
  )

  return (
    <div className="w-full">
      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-3 bg-transparent p-0 mb-8">
            {Object.entries(TAB_MAPPINGS).map(([key, { label, icon, color }]) => (
              <TabsTrigger
                key={key}
                value={key}
                className={`py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 border-2 ${
                  activeTab === key
                    ? `border-transparent bg-gradient-to-r ${color} text-white shadow-lg`
                    : "border-border bg-card text-foreground hover:bg-muted-light"
                }`}
              >
                <div className="flex items-center gap-2">
                  {icon}
                  <span>{label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(TAB_MAPPINGS).map(([key, { color }]) => (
            <TabsContent key={key} value={key} className="mt-0 animate-fade-in">
              <div className="rounded-2xl border-2 border-border bg-card p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className={`flex items-center gap-3 mb-6 pb-6 border-b-2 border-primary/20`}>
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color}`}></div>
                  <h2 className="text-2xl font-bold text-primary">{TAB_MAPPINGS[key].label} Rules</h2>
                  <span className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {groupedRules[key]?.length || 0}
                  </span>
                </div>

                {groupedRules[key] && groupedRules[key].length > 0 ? (
                  <div className="max-h-[700px] overflow-y-auto pr-4 space-y-2">
                    <RuleAccordion rules={groupedRules[key]} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted-light flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">No rules available for this category</p>
                    <p className="text-muted text-sm mt-1">Check back soon for updates</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
