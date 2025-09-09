"use client"

import React from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface GenerateStepProps {
  downloadUrl: string | null
  resetFlow: () => void
}

export function GenerateStep({ downloadUrl, resetFlow }: GenerateStepProps) {
  return (
    <Card className="max-w-2xl mx-auto text-center bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-center gap-2 text-accent">
          <Download className="w-6 h-6" />
          Code Generated Successfully!
        </CardTitle>
        <CardDescription className="text-muted-foreground">Your code has been generated and is ready for download</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {downloadUrl ? (
          <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <a href={downloadUrl} download>
              <Download className="w-4 h-4 mr-2" />
              Download Code ZIP
            </a>
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Preparing download...
          </div>
        )}
        <Button 
          variant="outline" 
          onClick={resetFlow} 
          className="w-full bg-background border-border hover:bg-accent text-foreground"
        >
          Generate Another
        </Button>
      </CardContent>
    </Card>
  )
}
