"use client"

import type React from "react"
import { useMemo, useState, useEffect } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface LoanRule {
  DUS_section: string
  DUS_summary: string
  rule_source: string
  textual_rule: string
  sub_rule_text: string
  sub_rule_conformity: string
  subrule_outcome: string
  rule_conformity: string
  rule_outcome: string
}

const LoanConformityDashboardComponent: React.FC = () => {
  const [rules, setRules] = useState<LoanRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSection, setFilterSection] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  // Load CSV on mount
  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch("/loan_rules.csv")
        const csvText = await response.text()

        // Dynamically import Papa Parse
        const Papa = (await import("papaparse")).default

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: { data: LoanRule[] }) => {
            setRules(results.data)
            setLoading(false)
          },
          error: (parseError: Error) => {
            setError(`Failed to parse CSV: ${parseError.message}`)
            setLoading(false)
          },
        })
      } catch (err) {
        setError("Failed to load loan rules file")
        setLoading(false)
      }
    }

    loadCSV()
  }, [])

  // Compute statistics
  const stats = useMemo(() => {
    if (!rules.length) return null

    const totalRules = rules.length
    const passRules = rules.filter((r) => r.rule_conformity === "PASS").length
    const failingRules = rules.filter((r) => r.rule_conformity === "FAIL").length
    const failingSubrules = rules.filter((r) => r.sub_rule_conformity === "FAIL").length

    const totalChecks = rules.length * 2 // rule + subrule
    const passCount = passRules + rules.filter((r) => r.sub_rule_conformity === "PASS").length
    const overallScore = Math.round((passCount / totalChecks) * 100)

    // Pass rates by section
    const sectionStats = ["Income & Expenses", "Valuation", "Management & Exit"].map((section) => {
      const sectionRules = rules.filter((r) => r.rule_source === section)
      const passCount = sectionRules.filter((r) => r.rule_conformity === "PASS").length
      const passRate = sectionRules.length ? Math.round((passCount / sectionRules.length) * 100) : 0
      return { section, passRate, total: sectionRules.length }
    })

    return { overallScore, failingRules, failingSubrules, sectionStats, totalRules }
  }, [rules])

  // Filter rules
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const matchesSearch =
        rule.textual_rule.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.DUS_section.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.rule_source.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSection = filterSection === "all" || rule.rule_source === filterSection
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "PASS" && rule.rule_conformity === "PASS") ||
        (filterStatus === "FAIL" && rule.rule_conformity === "FAIL")
      return matchesSearch && matchesSection && matchesStatus
    })
  }, [rules, searchQuery, filterSection, filterStatus])

  // Diagnostic summary
  const diagnostics = useMemo(() => {
    if (!stats) return null

    if (stats.failingRules === 0 && stats.failingSubrules === 0) {
      return {
        type: "success",
        message: "Loan is fully conforming",
        details: "All rules and subrules have passed their conformity checks.",
        recommendations: [],
      }
    }

    const lowSections = stats.sectionStats.filter((s) => s.passRate < 80)
    const failedRuleDetails = rules
      .filter((r) => r.rule_conformity === "FAIL")
      .slice(0, 3)
      .map((r) => ({
        rule: r.textual_rule,
        reason: r.sub_rule_text,
        outcome: r.subrule_outcome,
      }))

    const recommendations = [
      lowSections.length > 0
        ? `Review rules in ${lowSections.map((s) => s.section).join(", ")} sections (pass rate < 80%)`
        : null,
      stats.failingRules > 3 ? "Prioritize fixing the highest-impact rules first" : null,
      "Schedule a compliance review meeting with underwriting team",
    ].filter(Boolean)

    return {
      type: "warning",
      message: `Loan has ${stats.failingRules} failing rule(s) and ${stats.failingSubrules} failing sub-rule(s)`,
      details: failedRuleDetails,
      recommendations: recommendations as string[],
    }
  }, [stats, rules])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvText = e.target?.result as string
        const Papa = (await import("papaparse")).default

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: { data: LoanRule[] }) => {
            setRules(results.data)
            setError(null)
          },
          error: (parseError: Error) => {
            setError(`Failed to parse CSV: ${parseError.message}`)
          },
        })
      } catch (err) {
        setError("Failed to upload CSV file")
      }
    }
    reader.readAsText(file)
  }

  const complianceData = useMemo(() => {
    const passRules = rules.filter((r) => r.rule_conformity === "PASS").length
    const failRules = rules.filter((r) => r.rule_conformity === "FAIL").length
    return [
      { name: "Passing", value: passRules, fill: "#22c55e" },
      { name: "Failing", value: failRules, fill: "#ef4444" },
    ]
  }, [rules])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading loan conformity data...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">No loan rules data available</p>
        </div>
      </div>
    )
  }

  const scoreColor =
    stats.overallScore >= 80 ? "text-green-600" : stats.overallScore >= 50 ? "text-yellow-600" : "text-red-600"
  const scoreBgColor =
    stats.overallScore >= 80 ? "bg-green-50" : stats.overallScore >= 50 ? "bg-yellow-50" : "bg-red-50"

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${scoreBgColor}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Conformity Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${scoreColor}`}>{stats.overallScore}%</div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(stats.sectionStats.reduce((acc, s) => acc + s.passRate, 0) / stats.sectionStats.length)}%
              average pass rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failing Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">{stats.failingRules}</div>
            <p className="text-xs text-muted-foreground mt-2">Rules with FAIL status</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failing Sub-rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">{stats.failingSubrules}</div>
            <p className="text-xs text-muted-foreground mt-2">Sub-rules with FAIL status</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">{stats.totalRules}</div>
            <p className="text-xs text-muted-foreground mt-2">Rules in dataset</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Pass Rate by Section</CardTitle>
              <CardDescription>Conformity percentage across Fannie Mae sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.sectionStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="section" angle={-15} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="passRate" fill="#0047AB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Rules Table with Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Rules Details</CardTitle>
              <CardDescription>Search and filter loan conformity rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="space-y-3">
                <Input
                  placeholder="Search by rule text or section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md text-sm bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="PASS">Pass Only</option>
                    <option value="FAIL">Fail Only</option>
                  </select>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md text-sm bg-background"
                  >
                    <option value="all">All Sections</option>
                    {[...new Set(rules.map((r) => r.rule_source))].map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredRules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No rules match your filters</div>
                ) : (
                  filteredRules.map((rule, idx) => (
                    <div key={idx} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant={rule.rule_conformity === "PASS" ? "default" : "destructive"}>
                              {rule.rule_conformity}
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">{rule.DUS_section}</span>
                          </div>
                          <p className="font-semibold text-foreground line-clamp-2">{rule.textual_rule}</p>
                          <p className="text-sm text-muted-foreground mt-1">{rule.rule_source}</p>
                        </div>
                        <button
                          onClick={() => {
                            const newSet = new Set(expandedRows)
                            if (newSet.has(idx)) {
                              newSet.delete(idx)
                            } else {
                              newSet.add(idx)
                            }
                            setExpandedRows(newSet)
                          }}
                          className="px-3 py-1 text-primary hover:bg-muted rounded transition-colors whitespace-nowrap font-bold"
                        >
                          {expandedRows.has(idx) ? "−" : "+"}
                        </button>
                      </div>

                      {expandedRows.has(idx) && (
                        <div className="border-t border-border pt-3 space-y-3 bg-muted/20 p-3 rounded">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Sub-rule</p>
                            <p className="text-sm">{rule.sub_rule_text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant={rule.sub_rule_conformity === "PASS" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {rule.sub_rule_conformity}
                              </Badge>
                            </div>
                          </div>
                          {rule.rule_conformity === "FAIL" && (
                            <div className="bg-red-50 p-3 rounded border border-red-200">
                              <p className="text-xs font-semibold text-red-900 mb-1">Failure Reason</p>
                              <p className="text-sm text-red-800">This rule is failing because: {rule.sub_rule_text}</p>
                              <p className="text-xs text-red-700 mt-2">
                                <strong>Outcome:</strong> {rule.subrule_outcome}
                              </p>
                            </div>
                          )}
                          {rule.rule_outcome && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">Rule Outcome</p>
                              <p className="text-sm text-foreground">{rule.rule_outcome}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Summary only - no upload */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Rules passing vs failing breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} rules`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card
            className={
              diagnostics?.type === "success" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
            }
          >
            <CardHeader>
              <CardTitle className={diagnostics?.type === "success" ? "text-green-900" : "text-yellow-900"}>
                Loan Diagnostic Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p
                  className={`font-semibold ${diagnostics?.type === "success" ? "text-green-700" : "text-yellow-700"}`}
                >
                  {diagnostics?.message}
                </p>
                <p className="text-sm text-foreground mt-2">
                  {typeof diagnostics?.details === "string"
                    ? diagnostics.details
                    : `${diagnostics?.details?.length || 0} failing rule(s) detected`}
                </p>
              </div>

              {Array.isArray(diagnostics?.details) && diagnostics.details.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-semibold text-foreground">Failing Rules:</p>
                  {diagnostics.details.map((detail, idx) => (
                    <div key={idx} className="text-xs space-y-1 p-2 bg-white rounded border border-yellow-200">
                      <p className="font-medium">{detail.rule}</p>
                      <p className="text-muted-foreground">{detail.outcome}</p>
                    </div>
                  ))}
                </div>
              )}

              {diagnostics?.recommendations && diagnostics.recommendations.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-semibold text-foreground">Recommendations:</p>
                  <ul className="space-y-1 text-xs">
                    {diagnostics.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>Fannie Mae Loan Surveillance System - All data is confidential and for authorized personnel only</p>
      </div>
    </div>
  )
}

export default LoanConformityDashboardComponent
export { LoanConformityDashboardComponent as LoanConformityDashboard }

