"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface Field {
  name: string
  type: string
  isRelation?: boolean
}

interface ModelConfig {
  enableCreate: boolean
  enableUpdate: boolean
  enableGet: boolean
  enableGetByRelation: boolean
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
    includeFields: string[]
    excludeFields: string[]
    childFields: string[]
  }
}

interface ModelConfigCardProps {
  model: {
    name: string
    fields: Field[]
  }
  config: ModelConfig
  onConfigChange: (config: ModelConfig) => void
}

export function ModelConfigCard({ model, config, onConfigChange }: ModelConfigCardProps) {
  const [mode, setMode] = useState<"ui" | "json">("ui")
  const [draft, setDraft] = useState<string>(JSON.stringify(config, null, 2))

  useEffect(() => {
    setDraft(JSON.stringify(config, null, 2))
  }, [config])

  const updateFieldConfig = (
    field: string,
    changes: {
      search?: { searchable?: boolean; excluded?: boolean }
      relation?: { include?: boolean; exclude?: boolean; child?: boolean }
    }
  ) => {
    const searchables = new Set(config.searchConfig.searchableFields)
    const excluded = new Set(config.searchConfig.excludedFields)
    const includeSet = new Set(config.relationConfig.includeFields)
    const excludeSet = new Set(config.relationConfig.excludeFields)
    const childSet = new Set(config.relationConfig.childFields)

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

    onConfigChange({
      ...config,
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

  const handleJsonChange = (json: string) => {
    try {
      const parsed = JSON.parse(json)
      onConfigChange(parsed)
    } catch (_) { }
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">{model.name}</CardTitle>
          <Badge variant="outline" className="border-border text-foreground">{model.fields.length} fields</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value: "ui" | "json") => value && setMode(value)}
            className="flex gap-2"
          >
            <ToggleGroupItem
              value="ui"
              className={`px-3 py-1.5 rounded-md transition-all text-sm ${
                mode === "ui"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              UI Mode
            </ToggleGroupItem>
            <ToggleGroupItem
              value="json"
              className={`px-3 py-1.5 rounded-md transition-all text-sm ${
                mode === "json"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              JSON Mode
            </ToggleGroupItem>
          </ToggleGroup>

          {mode === "ui" ? (
            <div className="space-y-3">
              {/* Basic Operations */}
              <div className="p-3 border rounded-lg bg-muted/20 border-border">
                <h4 className="font-medium mb-2 text-foreground">Basic Operations</h4>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">Enable Create</span>
                    <input
                      type="checkbox"
                      checked={config.enableCreate}
                      onChange={(e) => onConfigChange({ ...config, enableCreate: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">Enable Update</span>
                    <input
                      type="checkbox"
                      checked={config.enableUpdate}
                      onChange={(e) => onConfigChange({ ...config, enableUpdate: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">Enable Get</span>
                    <input
                      type="checkbox"
                      checked={config.enableGet}
                      onChange={(e) => onConfigChange({ ...config, enableGet: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">Enable Get by Relation</span>
                    <input
                      type="checkbox"
                      checked={config.enableGetByRelation}
                      onChange={(e) => onConfigChange({ ...config, enableGetByRelation: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                </div>
              </div>

              {/* Nested Create Configuration */}
              <div className="p-3 border rounded-lg bg-muted/20 border-border">
                <h4 className="font-medium mb-2 text-foreground">Nested Create Configuration</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-foreground">Enable Nested Create</span>
                    <input
                      type="checkbox"
                      checked={config.nestedCreateConfig.enabled}
                      onChange={(e) =>
                        onConfigChange({
                          ...config,
                          nestedCreateConfig: {
                            ...config.nestedCreateConfig,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-border"
                    />
                  </label>
                  {config.nestedCreateConfig.enabled && (
                    <div>
                      <Label htmlFor={`${model.name}-nesting-level`} className="text-foreground text-sm">Max Nesting Level</Label>
                      <Input
                        id={`${model.name}-nesting-level`}
                        type="number"
                        min="1"
                        max="5"
                        value={config.nestedCreateConfig.maxNestingLevel}
                        onChange={(e) =>
                          onConfigChange({
                            ...config,
                            nestedCreateConfig: {
                              ...config.nestedCreateConfig,
                              maxNestingLevel: Number.parseInt(e.target.value) || 2,
                            },
                          })
                        }
                        className="w-16 h-7 text-sm bg-background border-border text-foreground"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Search & Relation Configuration */}
              <div className="p-3 border rounded-lg bg-muted/20 border-border">
                <h4 className="font-medium mb-2 text-foreground">Search & Relation Configuration</h4>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-foreground">Enable Search</span>
                  <input
                    type="checkbox"
                    checked={config.searchConfig.enabled}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        searchConfig: {
                          ...config.searchConfig,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-border"
                  />
                </div>
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-foreground">Include Relation Search</span>
                  <input
                    type="checkbox"
                    checked={config.searchConfig.includeRelationSearch}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        searchConfig: {
                          ...config.searchConfig,
                          includeRelationSearch: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-border"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-left text-muted-foreground">
                      <tr>
                        <th className="py-1">Field</th>
                        <th className="py-1">Type</th>
                        <th className="py-1">Searchable</th>
                        <th className="py-1">Excluded</th>
                        <th className="py-1">Include</th>
                        <th className="py-1">Exclude</th>
                        <th className="py-1">Child</th>
                      </tr>
                    </thead>
                    <tbody>
                      {model.fields.map((f) => {
                        const searchables = new Set(config.searchConfig.searchableFields)
                        const excluded = new Set(config.searchConfig.excludedFields)
                        const includeSet = new Set(config.relationConfig.includeFields)
                        const excludeSet = new Set(config.relationConfig.excludeFields)
                        const childSet = new Set(config.relationConfig.childFields)
                        const isStringField = f.type === 'String'
                        const isRelationField = (!['String', 'Int', 'Float', 'Boolean', 'DateTime'].includes(f.type)) || f.type.includes('[]') || f.type.includes('?')

                        return (
                          <tr key={f.name} className="border-t border-border/50">
                            <td className="py-1 pr-1 font-mono text-foreground">{f.name}</td>
                            <td className="py-1 pr-1 text-muted-foreground">{f.type}</td>
                            <td className="py-1">
                              <input
                                type="checkbox"
                                checked={searchables.has(f.name)}
                                onChange={(e) =>
                                  updateFieldConfig(f.name, {
                                    search: { searchable: e.target.checked },
                                  })
                                }
                                disabled={!isStringField}
                                className={`rounded border-border ${!isStringField ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            </td>
                            <td className="py-1">
                              <input
                                type="checkbox"
                                checked={excluded.has(f.name)}
                                onChange={(e) =>
                                  updateFieldConfig(f.name, {
                                    search: { excluded: e.target.checked },
                                  })
                                }
                                disabled={!isStringField}
                                className={`rounded border-border ${!isStringField ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            </td>
                            <td className="py-1">
                              <input
                                type="checkbox"
                                checked={includeSet.has(f.name)}
                                onChange={(e) =>
                                  updateFieldConfig(f.name, {
                                    relation: { include: e.target.checked },
                                  })
                                }
                                disabled={!isRelationField}
                                className={`rounded border-border ${!isRelationField ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            </td>
                            <td className="py-1">
                              <input
                                type="checkbox"
                                checked={excludeSet.has(f.name)}
                                onChange={(e) =>
                                  updateFieldConfig(f.name, {
                                    relation: { exclude: e.target.checked },
                                  })
                                }
                                disabled={!isRelationField}
                                className={`rounded border-border ${!isRelationField ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            </td>
                            <td className="py-1">
                              <input
                                type="checkbox"
                                checked={childSet.has(f.name)}
                                onChange={(e) =>
                                  updateFieldConfig(f.name, {
                                    relation: { child: e.target.checked },
                                  })
                                }
                                disabled={!isRelationField}
                                className={`rounded border-border ${!isRelationField ? 'opacity-50 cursor-not-allowed' : ''}`}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-foreground text-sm">Model Config (JSON)</Label>
              <Textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  handleJsonChange(e.target.value)
                }}
                className="min-h-[180px] font-mono text-xs bg-background border-border text-foreground"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
