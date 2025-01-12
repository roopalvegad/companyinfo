'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ConfigPage() {
  const [fields, setFields] = useState<{ name: string; prompt: string }[]>([
    { name: '', prompt: '' }
  ])

  const addField = () => {
    setFields([...fields, { name: '', prompt: '' }])
  }

  const updateField = (index: number, key: 'name' | 'prompt', value: string) => {
    const newFields = [...fields]
    newFields[index][key] = value
    setFields(newFields)
  }

  const saveConfig = () => {
    localStorage.setItem('extractionConfig', JSON.stringify(fields))
    alert('Configuration saved!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Extraction Configuration</h1>
      {fields.map((field, index) => (
        <div key={index} className="space-y-2">
          <Label htmlFor={`field-name-${index}`}>Field Name</Label>
          <Input
            id={`field-name-${index}`}
            value={field.name}
            onChange={(e) => updateField(index, 'name', e.target.value)}
          />
          <Label htmlFor={`field-prompt-${index}`}>Extraction Prompt</Label>
          <Textarea
            id={`field-prompt-${index}`}
            value={field.prompt}
            onChange={(e) => updateField(index, 'prompt', e.target.value)}
          />
        </div>
      ))}
      <Button onClick={addField}>Add Field</Button>
      <Button onClick={saveConfig}>Save Configuration</Button>
    </div>
  )
}

