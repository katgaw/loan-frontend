"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RulesViewer from "@/components/rules-viewer"
import LoanConformityDashboard from "@/components/loan-conformity-dashboard"
import Image from "next/image"
import { BarChart3, CheckSquare } from "lucide-react"

export default function Page() {
  const [activeTab, setActiveTab] = useState("rules")

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-to-r from-primary to-primary/95">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <Image
                src="/fannie-mae-logo.png"
                alt="Fannie Mae"
                width={56}
                height={56}
                className="w-10 h-10 text-white"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Loan Surveillance</h1>
              <p className="text-white/80 mt-1">Fannie Mae Compliance and Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-muted p-1 mb-8 rounded-lg max-w-2xl mx-auto">
            <TabsTrigger
              value="rules"
              className="flex items-center gap-2 py-3 px-6 rounded-md font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <CheckSquare className="w-5 h-5" />
              Surveillance Rules
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 py-3 px-6 rounded-md font-semibold transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <BarChart3 className="w-5 h-5" />
              Conformity Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-0">
            <div className="container mx-auto">
              <RulesViewer />
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <div className="container mx-auto">
              <LoanConformityDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
