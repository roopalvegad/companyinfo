'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Company {
  name: string
  url: string
}

interface ExtractionField {
  name: string
  prompt: string
}

export default function ResultsPage() {
  const [results, setResults] = useState<Record<string, any>[]>([])
  const [fields, setFields] = useState<ExtractionField[]>([])

  useEffect(() => {
    const storedCompanies = localStorage.getItem('companies')
    const storedConfig = localStorage.getItem('extractionConfig')
    
    if (storedCompanies && storedConfig) {
      const companies: Company[] = JSON.parse(storedCompanies)
      const config: ExtractionField[] = JSON.parse(storedConfig)
      setFields(config)
      
      const fetchData = async () => {
        const extractedData = await Promise.all(
          companies.map(async (company) => {
            const companyData: Record<string, any> = { name: company.name, url: company.url }
            for (const field of config) {
              companyData[field.name] = await extractInfoFromPerplexity(company, field)
            }
            return companyData
          })
        )
        setResults(extractedData)
      }
      
      fetchData()
    }
  }, [])

  const extractInfoFromPerplexity = async (company: Company, field: ExtractionField) => {
    // TODO: Implement actual API call to Perplexity
    // This is a placeholder implementation
    return `Extracted ${field.name} for ${company.name}`
  }

  const exportToCsv = () => {
    const headers = ['name', 'url', ...fields.map(f => f.name)]
    const csvContent = [
      headers.join(','),
      ...results.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'company_info.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Extraction Results</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company Name</TableHead>
            <TableHead>URL</TableHead>
            {fields.map((field, index) => (
              <TableHead key={index}>{field.name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.url}</TableCell>
              {fields.map((field, fieldIndex) => (
                <TableCell key={fieldIndex}>{row[field.name]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={exportToCsv}>Export to CSV</Button>
    </div>
  )
}

