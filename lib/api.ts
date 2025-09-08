import { ParsedSchema, SchemaModel } from "@/types/schema"

export interface ParseSchemaResponse {
  enums: any[]
  models: SchemaModel[]
}

export async function parseSchemaApi(prismaSchema: string): Promise<ParseSchemaResponse> {
  const url = process.env.NEXT_PUBLIC_GET_JSON_URL || ""
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schema: prismaSchema })
  })
  if (!response.ok) {
    throw new Error("Failed to parse schema")
  }
  return response.json()
}

export async function generateCodeApi(payload: { schema: ParsedSchema["schema"]; config: ParsedSchema["config"]; }): Promise<{ body: string }> {
  const url = process.env.NEXT_PUBLIC_GENERATE_URL || ""
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    throw new Error("Failed to generate code")
  }
  return response.json()
}


