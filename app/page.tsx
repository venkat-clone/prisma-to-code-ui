"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Download, Settings, Code, Loader2, FileText, Zap, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ModelConfig {
  enableCreate: boolean
  enableUpdate: boolean
  enableGet: boolean
  enableGetByRelation: boolean
  enableGetByField: boolean
  nestedCreateConfig: {
    enabled: boolean
    maxNestingLevel: number
  }
  searchConfig: {
    enabled: boolean
    includeRelationSearch: boolean
    searchableFields: string[]
    excludedFields: string[]
  }
  relationConfig: {
    enabled: boolean
    includeFields: string[]
    excludeFields: string[]
    childFields: string[]
  }
  importConfig: {
    enabled: boolean
    importModels: string[]
  }
}

interface SchemaModel {
  name: string
  fields: Array<{
    name: string
    type: string
    kind: string
    isRequired: boolean
    isUnique: boolean
    isId: boolean
  }>
}

interface ParsedSchema {
  schema: {
    enums: any[]
    models: SchemaModel[]
  }
  config: Record<string, ModelConfig>
}

export default function PrismaGenerator() {
  const [step, setStep] = useState<"upload" | "configure" | "generate">("upload")
  const [prismaSchema, setPrismaSchema] = useState("")
  const [parsedSchema, setParsedSchema] = useState<ParsedSchema | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [uploadMethod, setUploadMethod] = useState<"text" | "file">("text")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".prisma") && !file.name.endsWith(".schema")) {
      setError("Please upload a .prisma or .schema file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setPrismaSchema(content)
      setError("")
    }
    reader.onerror = () => {
      setError("Failed to read file")
    }
    reader.readAsText(file)
  }

  const handleSchemaUpload = async () => {
    if (!prismaSchema.trim()) {
      setError("Please enter a Prisma schema")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GET_JSON_URL||'', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          schema: prismaSchema,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to parse schema")
      }

      const data = await response.json()

      // Initialize default config for each model
      const defaultConfig: Record<string, ModelConfig> = {}
      data.models.forEach((model: SchemaModel) => {
        defaultConfig[model.name] = {
          enableCreate: true,
          enableUpdate: true,
          enableGet: true,
          enableGetByRelation: true,
          enableGetByField: true,
          nestedCreateConfig: {
            enabled: true,
            maxNestingLevel: 2,
          },
          searchConfig: {
            enabled: true,
            includeRelationSearch: true,
            searchableFields: [],
            excludedFields: [],
          },
          relationConfig: {
            enabled: true,
            includeFields: [],
            excludeFields: [],
            childFields: [],
          },
          importConfig: {
            enabled: false,
            importModels: [],
          },
        }
      })

      setParsedSchema({
        schema: data,
        config: defaultConfig,
      })
      setStep("configure")
    } catch (err) {
      console.error(err);
      setError("Failed to parse Prisma schema. Please check your schema format.")
    } finally {
      setIsLoading(false)
    }
  }

  const updateModelConfig = (modelName: string, updates: Partial<ModelConfig>) => {
    if (!parsedSchema) return

    setParsedSchema({
      ...parsedSchema,
      config: {
        ...parsedSchema.config,
        [modelName]: {
          ...parsedSchema.config[modelName],
          ...updates,
        },
      },
    })
  }

  const handleGenerate = async () => {
    if (!parsedSchema) return

    setIsLoading(true)
    setError("")

    try {
      const payload = {
        schema: parsedSchema.schema,
        config: parsedSchema.config,
      }

      // Replace with your actual API 2 endpoint
      const response = await fetch(process.env.NEXT_PUBLIC_GENERATE_URL||'', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to generate code")
      }

      const result = await response.json()
      setDownloadUrl(result.body)
      setStep("generate")
    } catch (err) {
      setError("Failed to generate code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetFlow = () => {
    setStep("upload")
    setPrismaSchema("")
    setParsedSchema(null)
    setError("")
    setDownloadUrl("")
    setUploadMethod("text")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
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

      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
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

        {error && (
          <Alert className="mb-6 border-destructive/50 text-destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload Schema */}
        {step === "upload" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Prisma Schema
              </CardTitle>
              <CardDescription>Upload a .prisma file or paste your schema below to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center gap-4 p-1 bg-muted rounded-lg">
                <Button
                  variant={uploadMethod === "text" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setUploadMethod("text")}
                  className="flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Paste Text
                </Button>
                <Button
                  variant={uploadMethod === "file" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setUploadMethod("file")}
                  className="flex-1"
                >
                  <File className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>

              {uploadMethod === "file" ? (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Drop your Prisma schema file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".prisma,.schema"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {prismaSchema && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">File loaded successfully:</p>
                      <div className="max-h-32 overflow-y-auto">
                        <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
                          {prismaSchema.slice(0, 200)}
                          {prismaSchema.length > 200 && "..."}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="schema">Prisma Schema</Label>
                  <Textarea
                    id="schema"
                    placeholder="model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}"
                    value={prismaSchema}
                    onChange={(e) => setPrismaSchema(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
              )}

              <Button onClick={handleSchemaUpload} disabled={isLoading || !prismaSchema.trim()} className="w-full">
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
        )}

        {/* Step 2: Configure Models */}
        {step === "configure" && parsedSchema && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Options</CardTitle>
                <CardDescription>Customize the code generation settings for each model in your schema</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="space-y-4">
                  {parsedSchema.schema.models.map((model) => (
                    <AccordionItem key={model.name} value={model.name} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{model.name}</Badge>
                          <span className="text-sm text-muted-foreground">{model.fields.length} fields</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-6 pt-4">
                        {/* Basic Operations */}
                        <div>
                          <h4 className="font-medium mb-3">Basic Operations</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${model.name}-create`}>Enable Create</Label>
                              <Switch
                                id={`${model.name}-create`}
                                checked={parsedSchema.config[model.name].enableCreate}
                                onCheckedChange={(checked) => updateModelConfig(model.name, { enableCreate: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${model.name}-update`}>Enable Update</Label>
                              <Switch
                                id={`${model.name}-update`}
                                checked={parsedSchema.config[model.name].enableUpdate}
                                onCheckedChange={(checked) => updateModelConfig(model.name, { enableUpdate: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${model.name}-get`}>Enable Get</Label>
                              <Switch
                                id={`${model.name}-get`}
                                checked={parsedSchema.config[model.name].enableGet}
                                onCheckedChange={(checked) => updateModelConfig(model.name, { enableGet: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${model.name}-relation`}>Enable Get by Relation</Label>
                              <Switch
                                id={`${model.name}-relation`}
                                checked={parsedSchema.config[model.name].enableGetByRelation}
                                onCheckedChange={(checked) =>
                                  updateModelConfig(model.name, { enableGetByRelation: checked })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Nested Create Config */}
                        <div>
                          <h4 className="font-medium mb-3">Nested Create Configuration</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${model.name}-nested`}>Enable Nested Create</Label>
                              <Switch
                                id={`${model.name}-nested`}
                                checked={parsedSchema.config[model.name].nestedCreateConfig.enabled}
                                onCheckedChange={(checked) =>
                                  updateModelConfig(model.name, {
                                    nestedCreateConfig: {
                                      ...parsedSchema.config[model.name].nestedCreateConfig,
                                      enabled: checked,
                                    },
                                  })
                                }
                              />
                            </div>
                            {parsedSchema.config[model.name].nestedCreateConfig.enabled && (
                              <div>
                                <Label htmlFor={`${model.name}-nesting-level`}>Max Nesting Level</Label>
                                <Input
                                  id={`${model.name}-nesting-level`}
                                  type="number"
                                  min="1"
                                  max="5"
                                  value={parsedSchema.config[model.name].nestedCreateConfig.maxNestingLevel}
                                  onChange={(e) =>
                                    updateModelConfig(model.name, {
                                      nestedCreateConfig: {
                                        ...parsedSchema.config[model.name].nestedCreateConfig,
                                        maxNestingLevel: Number.parseInt(e.target.value) || 2,
                                      },
                                    })
                                  }
                                  className="w-20"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Search Configuration */}
                        <div>
                          <h4 className="font-medium mb-3">Search Configuration</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${model.name}-search`}>Enable Search</Label>
                              <Switch
                                id={`${model.name}-search`}
                                checked={parsedSchema.config[model.name].searchConfig.enabled}
                                onCheckedChange={(checked) =>
                                  updateModelConfig(model.name, {
                                    searchConfig: {
                                      ...parsedSchema.config[model.name].searchConfig,
                                      enabled: checked,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${model.name}-relation-search`}>Include Relation Search</Label>
                              <Switch
                                id={`${model.name}-relation-search`}
                                checked={parsedSchema.config[model.name].searchConfig.includeRelationSearch}
                                onCheckedChange={(checked) =>
                                  updateModelConfig(model.name, {
                                    searchConfig: {
                                      ...parsedSchema.config[model.name].searchConfig,
                                      includeRelationSearch: checked,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={resetFlow}>
                Back to Upload
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading} className="flex-1">
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
          </div>
        )}

        {/* Step 3: Download Generated Code */}
        {step === "generate" && (
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-accent">
                <Download className="w-6 h-6" />
                Code Generated Successfully!
              </CardTitle>
              <CardDescription>Your code has been generated and is ready for download</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {downloadUrl ? (
                <Button asChild size="lg" className="w-full">
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

              <Button variant="outline" onClick={resetFlow} className="w-full bg-transparent">
                Generate Another
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
