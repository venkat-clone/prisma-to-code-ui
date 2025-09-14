"use client"

import React from "react"
import { usePrismaGenerator } from "@/hooks/usePrismaGenerator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/Header"
import { ProgressSteps } from "@/components/ProgressSteps"
import { UploadStep } from "@/components/UploadStep"
import { ConfigureStep } from "@/components/ConfigureStep"
import { GenerateStep } from "@/components/GenerateStep"

export default function PrismaGenerator() {
  const { state, refs, actions } = usePrismaGenerator()
  const { step, prismaSchema, parsedSchema, isLoading, error, downloadUrl } = state
  const { fileInputRef } = refs
  const { setPrismaSchema, handleFileUpload, handleSchemaUpload, updateModelConfig, addModelToConfig, removeModelFromConfig, handleGenerate, resetFlow } = actions

  const loadDemoConfig = async () => {
    try {
      // Load demo config from assets directory
      const response = await fetch('/assets/demo.json')
      const demoSchema = await response.json()
      setPrismaSchema(JSON.stringify(demoSchema, null, 2))
    } catch (err) {
      console.error('Failed to load demo config:', err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-none mx-5 px-4 py-6">
        <ProgressSteps step={step} />

        {error && (
          <Alert className="mb-4 border-destructive/50 text-destructive bg-destructive/10">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload Schema */}
        {step === "upload" && (
          <UploadStep
            prismaSchema={prismaSchema}
            isLoading={isLoading}
            fileInputRef={fileInputRef}
            setPrismaSchema={setPrismaSchema}
            handleFileUpload={handleFileUpload}
            handleSchemaUpload={handleSchemaUpload}
            loadDemoConfig={loadDemoConfig}
          />
        )}

        {/* Step 2: Configure Models */}
        {step === "configure" && parsedSchema && (
          <ConfigureStep
            parsedSchema={parsedSchema}
            isLoading={isLoading}
            updateModelConfig={updateModelConfig}
            addModelToConfig={addModelToConfig}
            removeModelFromConfig={removeModelFromConfig}
            handleGenerate={handleGenerate}
            resetFlow={resetFlow}
          />
        )}

        {/* Step 3: Download Generated Code */}
        {step === "generate" && (
          <GenerateStep
            downloadUrl={downloadUrl}
            resetFlow={resetFlow}
          />
        )}
      </main>
    </div>
  )
}
