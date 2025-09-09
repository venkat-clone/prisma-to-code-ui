"use client"

import React from "react"
import { Code, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ModelConfigCard } from "./ModelConfigCard"

interface ParsedSchema {
  schema: {
    models: Array<{
      name: string
      fields: Array<{
        name: string
        type: string
        isRelation?: boolean
      }>
    }>
  }
  config: Record<string, any>
}

interface ConfigureStepProps {
  parsedSchema: ParsedSchema
  isLoading: boolean
  updateModelConfig: (modelName: string, config: any) => void
  handleGenerate: () => void
  resetFlow: () => void
}

export function ConfigureStep({
  parsedSchema,
  isLoading,
  updateModelConfig,
  handleGenerate,
  resetFlow
}: ConfigureStepProps) {
  return (
    <div className="mx-auto space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Configuration Options</CardTitle>
          <CardDescription className="text-muted-foreground">Customize the code generation settings for each model in your schema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsedSchema.schema.models.map((model) => (
              <ModelConfigCard
                key={model.name}
                model={model}
                config={parsedSchema.config[model.name]}
                onConfigChange={(config) => updateModelConfig(model.name, config)}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={resetFlow} className="bg-background border-border hover:bg-accent text-foreground">
              Back to Upload
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading} 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Code...
                </>
              ) : (
                <>
                  <Code className="w-4 h-4 mr-2" />
                  Generate Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
