export interface ModelConfig {
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

export interface SchemaField {
  name: string
  type: string
  kind: string
  isRequired: boolean
  isUnique: boolean
  isId: boolean
}

export interface SchemaModel {
  name: string
  fields: SchemaField[]
}

export interface ParsedSchema {
  schema: {
    enums: any[]
    models: SchemaModel[]
  }
  config: Record<string, ModelConfig>
}


