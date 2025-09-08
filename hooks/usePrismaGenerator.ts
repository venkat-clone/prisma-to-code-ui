"use client"

import { useRef, useState } from "react"
import { generateCodeApi, parseSchemaApi } from "@/lib/api"
import type { ModelConfig, ParsedSchema, SchemaModel } from "@/types/schema"

export type Step = "upload" | "configure" | "generate"

export function usePrismaGenerator() {
    const [step, setStep] = useState<Step>("upload")
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
            const data = await parseSchemaApi(prismaSchema)

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

            setParsedSchema({ schema: data, config: defaultConfig })
            setStep("configure")
        } catch (err) {
            console.error(err)
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
            const result = await generateCodeApi({
                schema: parsedSchema.schema,
                config: parsedSchema.config,
            })
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

    return {
        state: {
            step,
            prismaSchema,
            parsedSchema,
            isLoading,
            error,
            downloadUrl,
            uploadMethod,
        },
        refs: { fileInputRef },
        actions: {
            setUploadMethod,
            setPrismaSchema,
            handleFileUpload,
            handleSchemaUpload,
            updateModelConfig,
            handleGenerate,
            resetFlow,
            setStep,
        },
    }
}


