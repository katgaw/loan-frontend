import RulesViewer from "@/components/rules-viewer"
import Image from "next/image"

export const metadata = {
  title: "Loan Surveillance Rules | Fannie Mae",
  description: "Fannie Mae loan surveillance rules and compliance guidelines",
}

export default function Page() {
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
              <h1 className="text-4xl font-bold text-white">Loan Surveillance Rules</h1>
              <p className="text-white/80 mt-1">Fannie Mae Compliance and Monitoring Guidelines</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-10 px-4">
        <RulesViewer />
      </div>
    </main>
  )
}
