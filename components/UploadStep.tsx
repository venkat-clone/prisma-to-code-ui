"use client"

import React, { RefObject } from "react"
import { Upload, FileText, Loader2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface UploadStepProps {
  prismaSchema: string
  isLoading: boolean
  fileInputRef: RefObject<HTMLInputElement>
  setPrismaSchema: (schema: string) => void
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSchemaUpload: () => void
  loadDemoConfig: () => void
}

export function UploadStep({
  prismaSchema,
  isLoading,
  fileInputRef,
  setPrismaSchema,
  handleFileUpload,
  handleSchemaUpload,
  loadDemoConfig
}: UploadStepProps) {
  return (
    <Card className="max-w-2xl mx-auto bg-card border-border">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-foreground">
          <FileText className="w-5 h-5" />
          Upload Prisma Schema
        </CardTitle>
        <CardDescription className="text-muted-foreground">Upload a .prisma file, paste your schema, or use demo config</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer bg-muted/20"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault() }}
            onDrop={(e) => {
              e.preventDefault()
              const file = e.dataTransfer.files?.[0]
              if (!file) return
              if (!file.name.endsWith('.prisma') && !file.name.endsWith('.schema')) return
              const reader = new FileReader()
              reader.onload = (ev) => {
                const content = ev.target?.result as string
                setPrismaSchema(content)
              }
              reader.readAsText(file)
            }}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-base font-medium mb-1 text-foreground">Drop your Prisma schema file here</p>
            <p className="text-sm text-muted-foreground mb-3">or click to browse files</p>
            <Button variant="outline" size="sm" className="bg-background border-border hover:bg-accent">Choose File</Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".prisma,.schema"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
          <div>
            <Label htmlFor="schema" className="text-foreground">Or paste schema text</Label>
            <Textarea
              id="schema"
              placeholder={`model User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  posts Post[]\n}`}
              value={prismaSchema}
              onChange={(e) => setPrismaSchema(e.target.value)}
              className="min-h-[180px] font-mono text-sm bg-background border-border text-foreground"
            />
          </div>
          <Button variant="secondary" onClick={loadDemoConfig} className="w-full bg-muted hover:bg-muted/80 text-foreground">
            <FileText className="w-4 h-4 mr-2" />
            Load Demo Config
          </Button>
        </div>

        <Button 
          onClick={handleSchemaUpload} 
          disabled={isLoading || !prismaSchema.trim()} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parsing Schema...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Parse Schema
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
