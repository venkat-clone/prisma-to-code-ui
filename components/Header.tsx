"use client"

import { Code } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container max-w-max mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Code className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prisma Code Generator</h1>
            <p className="text-muted-foreground">Transform your Prisma schema into production-ready code</p>
          </div>
        </div>
      </div>
    </header>
  )
}
