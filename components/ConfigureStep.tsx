"use client"

import React, { useState } from "react"
import { Code, Loader2, Search, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  addModelToConfig: (modelName: string) => void
  removeModelFromConfig: (modelName: string) => void
  handleGenerate: () => void
  resetFlow: () => void
}

export function ConfigureStep({
  parsedSchema,
  isLoading,
  updateModelConfig,
  addModelToConfig,
  removeModelFromConfig,
  handleGenerate,
  resetFlow
}: ConfigureStepProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [addedModels, setAddedModels] = useState<string[]>([])

  // Filter available models based on search term
  const availableModels = parsedSchema.schema.models.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get models that are not yet added
  const filteredModels = availableModels.filter(model => 
    !addedModels.includes(model.name)
  )

  // Get added model objects
  const addedModelObjects = parsedSchema.schema.models.filter(model =>
    addedModels.includes(model.name)
  )

  const addModel = (modelName: string) => {
    if (!addedModels.includes(modelName)) {
      setAddedModels([...addedModels, modelName])
      addModelToConfig(modelName)
    }
  }

  const removeModel = (modelName: string) => {
    setAddedModels(addedModels.filter(name => name !== modelName))
    removeModelFromConfig(modelName)
  }

  return (
    <div className="mx-auto space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Configuration Options</CardTitle>
          <CardDescription className="text-muted-foreground">Search and add models to configure their code generation settings</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Model Search and Add Section */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search models to add..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border text-foreground"
              />
            </div>

            {/* Available Models */}
            {searchTerm && filteredModels.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Available Models</h4>
                <div className="flex flex-wrap gap-2">
                  {filteredModels.map((model) => (
                    <Button
                      key={model.name}
                      variant="outline"
                      size="sm"
                      onClick={() => addModel(model.name)}
                      className="h-8 px-3 text-xs bg-background border-border hover:bg-accent text-foreground"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {model.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Added Models */}
            {addedModels.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Added Models ({addedModels.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {addedModels.map((modelName) => (
                    <Badge
                      key={modelName}
                      variant="secondary"
                      className="px-3 py-1 bg-accent text-accent-foreground"
                    >
                      {modelName}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeModel(modelName)}
                        className="h-4 w-4 p-0 ml-2 hover:bg-background/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* No models added message */}
            {addedModels.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Search for models above to add them for configuration</p>
              </div>
            )}
          </div>

          {/* Model Configuration Cards */}
          {addedModelObjects.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-foreground">Model Configurations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addedModelObjects.map((model) => (
                  <ModelConfigCard
                    key={model.name}
                    model={model}
                    config={parsedSchema.config[model.name]}
                    onConfigChange={(config) => updateModelConfig(model.name, config)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={resetFlow} className="bg-background border-border hover:bg-accent text-foreground">
              Back to Upload
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isLoading || addedModels.length === 0} 
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
