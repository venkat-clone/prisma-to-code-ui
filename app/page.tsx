"use client"

import React, { useState, useEffect } from "react"
import { usePrismaGenerator } from "@/hooks/usePrismaGenerator"
import { Upload, Download, Settings, Code, Loader2, FileText, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function PrismaGenerator() {
  const { state, refs, actions } = usePrismaGenerator()
  const { step, prismaSchema, parsedSchema, isLoading, error, downloadUrl } = state
  const { fileInputRef } = refs
  const { setPrismaSchema, handleFileUpload, handleSchemaUpload, updateModelConfig, handleGenerate, resetFlow } = actions

  const loadDemoConfig = async () => {
    try {
      const response = await fetch('/assets/demo.json')
      const demoSchema = await response.text()
      setPrismaSchema(demoSchema)
    } catch (err) {
      console.error('Failed to load demo config:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container max-w-max mx-auto px-4 py-6">
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

      <main className="container max-w-none mx-5 px-4 py-8">
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
              <CardDescription>Upload a .prisma file, paste your schema, or use demo config</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
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
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop your Prisma schema file here</p>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                  <Button variant="outline" size="sm">Choose File</Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".prisma,.schema"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <Label htmlFor="schema">Or paste schema text</Label>
                  <Textarea
                    id="schema"
                    placeholder={`model User {\n  id    Int     @id @default(autoincrement())\n  email String  @unique\n  name  String?\n  posts Post[]\n}`}
                    value={prismaSchema}
                    onChange={(e) => setPrismaSchema(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <Button variant="secondary" onClick={loadDemoConfig} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Load Demo Config
                </Button>
              </div>

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
          <div className="mx-auto space-y-6">
            <Card className="bg-blue-300">
              <CardHeader>
                <CardTitle>Configuration Options</CardTitle>
                <CardDescription>Customize the code generation settings for each model in your schema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parsedSchema.schema.models.map((model) => (
                    <Card key={model.name} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <Badge variant="outline">{model.fields.length} fields</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ModeSection
                          jsonConfig={parsedSchema.config[model.name]}
                          onJsonChange={(json) => {
                            try {
                              const parsed = JSON.parse(json)
                              updateModelConfig(model.name, parsed)
                            } catch (_) { }
                          }}
                        >
                          {/* Basic Operations */}
                          <div className="p-4 border rounded-lg mb-4 shadow-sm bg-white">
                            <h4 className="font-medium mb-2">Basic Operations</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <label className="flex items-center justify-between gap-2">
                                <span>Enable Create</span>
                                <input
                                  type="checkbox"
                                  checked={parsedSchema.config[model.name].enableCreate}
                                  onChange={(e) =>
                                    updateModelConfig(model.name, { enableCreate: e.target.checked })
                                  }
                                />
                              </label>
                              <label className="flex items-center justify-between gap-2">
                                <span>Enable Update</span>
                                <input
                                  type="checkbox"
                                  checked={parsedSchema.config[model.name].enableUpdate}
                                  onChange={(e) =>
                                    updateModelConfig(model.name, { enableUpdate: e.target.checked })
                                  }
                                />
                              </label>
                              <label className="flex items-center justify-between gap-2">
                                <span>Enable Get</span>
                                <input
                                  type="checkbox"
                                  checked={parsedSchema.config[model.name].enableGet}
                                  onChange={(e) =>
                                    updateModelConfig(model.name, { enableGet: e.target.checked })
                                  }
                                />
                              </label>
                              <label className="flex items-center justify-between gap-2">
                                <span>Enable Get by Relation</span>
                                <input
                                  type="checkbox"
                                  checked={parsedSchema.config[model.name].enableGetByRelation}
                                  onChange={(e) =>
                                    updateModelConfig(model.name, {
                                      enableGetByRelation: e.target.checked,
                                    })
                                  }
                                />
                              </label>
                            </div>
                          </div>

                          {/* Nested Create Configuration */}
                          <div className="p-4 border rounded-lg mb-4 shadow-sm bg-white">
                            <h4 className="font-medium mb-2">Nested Create Configuration</h4>
                            <div className="space-y-2">
                              <label className="flex items-center justify-between gap-2">
                                <span>Enable Nested Create</span>
                                <input
                                  type="checkbox"
                                  checked={parsedSchema.config[model.name].nestedCreateConfig.enabled}
                                  onChange={(e) =>
                                    updateModelConfig(model.name, {
                                      nestedCreateConfig: {
                                        ...parsedSchema.config[model.name].nestedCreateConfig,
                                        enabled: e.target.checked,
                                      },
                                    })
                                  }
                                />
                              </label>
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
                                    className="w-20 h-8"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Search & Relation Configuration */}
                          <div className="p-4 border rounded-lg mb-4 shadow-sm bg-white">
                            <h4 className="font-medium mb-2">Search & Relation Configuration</h4>
                            <div className="mb-3 flex items-center justify-between">
                              <span>Enable Search</span>
                              <input
                                type="checkbox"
                                checked={parsedSchema.config[model.name].searchConfig.enabled}
                                onChange={(e) =>
                                  updateModelConfig(model.name, {
                                    searchConfig: {
                                      ...parsedSchema.config[model.name].searchConfig,
                                      enabled: e.target.checked,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="mb-3 flex items-center justify-between">
                              <span>Include Relation Search</span>
                              <input
                                type="checkbox"
                                checked={parsedSchema.config[model.name].searchConfig.includeRelationSearch}
                                onChange={(e) =>
                                  updateModelConfig(model.name, {
                                    searchConfig: {
                                      ...parsedSchema.config[model.name].searchConfig,
                                      includeRelationSearch: e.target.checked,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="text-left text-muted-foreground">
                                  <tr>
                                    <th className="py-2">Field</th>
                                    <th className="py-2">Type</th>
                                    <th className="py-2">Searchable</th>
                                    <th className="py-2">Excluded (Search)</th>
                                    <th className="py-2">Relation: Include</th>
                                    <th className="py-2">Relation: Exclude</th>
                                    <th className="py-2">Relation: Child</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {model.fields.map((f) => {
                                    const config = parsedSchema.config[model.name]
                                    const searchables = new Set(config.searchConfig.searchableFields)
                                    const excluded = new Set(config.searchConfig.excludedFields)
                                    const includeSet = new Set(config.relationConfig.includeFields)
                                    const excludeSet = new Set(config.relationConfig.excludeFields)
                                    const childSet = new Set(config.relationConfig.childFields)
                                    const isStringField = f.type === 'String'

                                    const updateFieldConfig = (
                                      field: string,
                                      changes: {
                                        search?: { searchable?: boolean; excluded?: boolean }
                                        relation?: { include?: boolean; exclude?: boolean; child?: boolean }
                                      }
                                    ) => {
                                      if (changes.search) {
                                        if (changes.search.searchable) searchables.add(field)
                                        else searchables.delete(field)

                                        if (changes.search.excluded) excluded.add(field)
                                        else excluded.delete(field)
                                      }

                                      if (changes.relation) {
                                        if (changes.relation.include) includeSet.add(field)
                                        else includeSet.delete(field)

                                        if (changes.relation.exclude) excludeSet.add(field)
                                        else excludeSet.delete(field)

                                        if (changes.relation.child) childSet.add(field)
                                        else childSet.delete(field)
                                      }

                                      updateModelConfig(model.name, {
                                        searchConfig: {
                                          ...config.searchConfig,
                                          searchableFields: Array.from(searchables),
                                          excludedFields: Array.from(excluded),
                                        },
                                        relationConfig: {
                                          ...config.relationConfig,
                                          includeFields: Array.from(includeSet),
                                          excludeFields: Array.from(excludeSet),
                                          childFields: Array.from(childSet),
                                        },
                                      })
                                    }

                                    return (
                                      <tr key={f.name} className="border-t border-border/50">
                                        <td className="py-2 pr-2 font-mono">{f.name}</td>
                                        <td className="py-2 pr-2">{f.type}</td>
                                        <td className="py-2">
                                          <input
                                            type="checkbox"
                                            checked={searchables.has(f.name)}
                                            onChange={(e) =>
                                              updateFieldConfig(f.name, {
                                                search: { searchable: e.target.checked },
                                              })
                                            }
                                            disabled={!isStringField}
                                            className={isStringField ? '' : 'opacity-50 cursor-not-allowed'}
                                          />
                                        </td>
                                        <td className="py-2">
                                          <input
                                            type="checkbox"
                                            checked={excluded.has(f.name)}
                                            onChange={(e) =>
                                              updateFieldConfig(f.name, {
                                                search: { excluded: e.target.checked },
                                              })
                                            }
                                            disabled={!isStringField}
                                            className={isStringField ? '' : 'opacity-50 cursor-not-allowed'}
                                          />
                                        </td>
                                        <td className="py-2">
                                          <input
                                            type="checkbox"
                                            checked={includeSet.has(f.name)}
                                            onChange={(e) =>
                                              updateFieldConfig(f.name, {
                                                relation: { include: e.target.checked },
                                              })
                                            }
                                            disabled={!isStringField}
                                            className={isStringField ? '' : 'opacity-50 cursor-not-allowed'}
                                          />
                                        </td>
                                        <td className="py-2">
                                          <input
                                            type="checkbox"
                                            checked={excludeSet.has(f.name)}
                                            onChange={(e) =>
                                              updateFieldConfig(f.name, {
                                                relation: { exclude: e.target.checked },
                                              })
                                            }
                                            disabled={!isStringField}
                                            className={isStringField ? '' : 'opacity-50 cursor-not-allowed'}
                                          />
                                        </td>
                                        <td className="py-2">
                                          <input
                                            type="checkbox"
                                            checked={childSet.has(f.name)}
                                            onChange={(e) =>
                                              updateFieldConfig(f.name, {
                                                relation: { child: e.target.checked },
                                              })
                                            }
                                            disabled={!isStringField}
                                            className={isStringField ? '' : 'opacity-50 cursor-not-allowed'}
                                          />
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </ModeSection>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
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
              </CardContent>
            </Card>
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

function ModeSection({ jsonConfig, onJsonChange, children }: { jsonConfig: any; onJsonChange: (json: string) => void; children: React.ReactNode }) {
  const [mode, setMode] = useState<"ui" | "json">("ui")
  const [draft, setDraft] = useState<string>(JSON.stringify(jsonConfig, null, 2))

  useEffect(() => {
    setDraft(JSON.stringify(jsonConfig, null, 2))
  }, [jsonConfig])

  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value: "ui" | "json") => value && setMode(value)}
        className="flex gap-2"
      >
        <ToggleGroupItem
          value="ui"
          className={`px-4 py-2 rounded-md transition-all ${
            mode === "ui"
              ? "bg-primary text-primary-foreground"
              : "bg-background border border-border hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          UI Mode
        </ToggleGroupItem>
        <ToggleGroupItem
          value="json"
          className={`px-4 py-2 rounded-md transition-all ${
            mode === "json"
              ? "bg-primary text-primary-foreground"
              : "bg-background border border-border hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          JSON Mode
        </ToggleGroupItem>
      </ToggleGroup>
      {mode === "ui" ? (
        <>{children}</>
      ) : (
        <div className="space-y-2">
          <Label>Model Config (JSON)</Label>
          <Textarea
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              onJsonChange(e.target.value)
            }}
            className="min-h-[200px] font-mono text-sm"
          />
        </div>
      )}
    </div>
  )
}