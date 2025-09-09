"use client"

import { Upload, Settings, Download } from "lucide-react"

interface ProgressStepsProps {
  step: "upload" | "configure" | "generate"
}

export function ProgressSteps({ step }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 ${step === "upload" ? "text-primary" : step === "configure" || step === "generate" ? "text-accent" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-primary text-primary-foreground" : step === "configure" || step === "generate" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Upload className="w-4 h-4" />
          </div>
          <span className="font-medium">Upload Schema</span>
        </div>
        <div className={`w-8 h-0.5 ${step === "configure" || step === "generate" ? "bg-accent" : "bg-muted"}`} />
        <div
          className={`flex items-center gap-2 ${step === "configure" ? "text-primary" : step === "generate" ? "text-accent" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "configure" ? "bg-primary text-primary-foreground" : step === "generate" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Settings className="w-4 h-4" />
          </div>
          <span className="font-medium">Configure</span>
        </div>
        <div className={`w-8 h-0.5 ${step === "generate" ? "bg-accent" : "bg-muted"}`} />
        <div
          className={`flex items-center gap-2 ${step === "generate" ? "text-primary" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "generate" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Download className="w-4 h-4" />
          </div>
          <span className="font-medium">Generate</span>
        </div>
      </div>
    </div>
  )
}
