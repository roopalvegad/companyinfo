'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [companies, setCompanies] = useState<{ name: string; url: string }[]>([
    { name: '', url: '' }
  ])
  const router = useRouter()

  const addCompany = () => {
    setCompanies([...companies, { name: '', url: '' }])
  }

  const updateCompany = (index: number, key: 'name' | 'url', value: string) => {
    const newCompanies = [...companies]
    newCompanies[index][key] = value
    setCompanies(newCompanies)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const lines = content.split('\n')
        const newCompanies = lines.map(line => {
          const [name, url] = line.split(',')
          return { name: name.trim(), url: url.trim() }
        })
        setCompanies(newCompanies)
      }
      reader.readAsText(file)
    }
  }

  const extractInfo = () => {
    localStorage.setItem('companies', JSON.stringify(companies))
    router.push('/results')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {companies.map((company, index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`company-name-${index}`}>Company Name</Label>
            <Input
              id={`company-name-${index}`}
              value={company.name}
              onChange={(e) => updateCompany(index, 'name', e.target.value)}
            />
            <Label htmlFor={`company-url-${index}`}>Company URL</Label>
            <Input
              id={`company-url-${index}`}
              value={company.url}
              onChange={(e) => updateCompany(index, 'url', e.target.value)}
            />
          </div>
        ))}
        <div className="flex gap-4">
          <Button onClick={addCompany}>Add Company</Button>
          <Button onClick={extractInfo} variant="secondary">Extract Information</Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="csv-upload">Upload CSV</Label>
          <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} />
        </div>
      </CardContent>
    </Card>
  )
}

