'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { extractCompanyInfo } from '@/lib/perplexity'
import Navigation from './components/Navigation'

export default function HomePage() {
  const [companies, setCompanies] = useState<{ name: string; url: string }[]>([
    { name: '', url: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [processedData, setProcessedData] = useState<Record<string, any>[]>([])

  const handleClear = () => {
    setCompanies([{ name: '', url: '' }])
    setError(null)
    setResult(null)
    setProcessedData([])
  }

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

  const exportToCsv = () => {
    if (!processedData.length) return;

    const headers = ['name', 'url', 'description', 'industry', 'products_services', 'headquarters', 'year_founded']
    const csvContent = [
      headers.join(','),
      ...processedData.map(row => headers.map(header => row[header] || '').join(','))
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

  const extractInfo = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setProcessedData([])

    try {
      // Filter out empty entries
      const validCompanies = companies.filter(c => c.name.trim() !== '')
      
      if (validCompanies.length === 0) {
        throw new Error('Please enter at least one company name')
      }

      // Extract just the company names for the API call
      const companyNames = validCompanies.map(c => c.name)
      const data = await extractCompanyInfo(companyNames)
      console.log('Received API response:', data)
      
      // Get the actual content from the API response
      const content = data.choices[0].message.content
      console.log('Raw content:', content)
      setResult(content)

      // Clean and parse the JSON content
      try {
        // Remove any markdown formatting if present and clean up whitespace
        const cleanContent = content
          .replace(/```json\n?|\n?```/g, '')
          .replace(/^\s+|\s+$/g, '') // Trim whitespace
          .replace(/\\n/g, '') // Remove escaped newlines
        console.log('Cleaned content:', cleanContent)
        
        let parsedContent
        try {
          parsedContent = JSON.parse(cleanContent)
        } catch (e) {
          // If direct parsing fails, try wrapping in quotes if needed
          const fixedContent = cleanContent
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3') // Add quotes to unquoted keys
          parsedContent = JSON.parse(fixedContent)
        }
        console.log('Parsed content:', parsedContent)

        // Get all available keys from the parsed content for debugging
        const availableKeys = Object.keys(parsedContent)
        console.log('Available keys in response:', availableKeys)
        
        const processed = validCompanies.map(company => {
          const normalizedCompanyName = company.name.trim()
          console.log(`Processing company: ${normalizedCompanyName}`)
          
          // Try different variations of the company name as keys
          const possibleKeys = [
            normalizedCompanyName,
            normalizedCompanyName.toLowerCase(),
            normalizedCompanyName.toUpperCase(),
            normalizedCompanyName.replace(/\s+/g, ''),
            normalizedCompanyName.replace(/[^a-zA-Z0-9]/g, ''),
            // Add common company suffixes/variations
            normalizedCompanyName + ' Inc.',
            normalizedCompanyName + ' Inc',
            normalizedCompanyName + ' Corporation',
            normalizedCompanyName + ' Corp',
            normalizedCompanyName + ' Ltd',
            normalizedCompanyName + ' LLC',
            // Remove common suffixes if they exist
            normalizedCompanyName.replace(/(Inc\.?|Corporation|Corp\.?|Ltd\.?|LLC)$/i, '').trim(),
            // Special case for common abbreviations
            normalizedCompanyName === 'FB' ? 'Facebook' : normalizedCompanyName,
            normalizedCompanyName === 'Meta' ? 'Facebook' : normalizedCompanyName,
            // Handle "The" prefix
            normalizedCompanyName.replace(/^The\s+/i, ''),
            'The ' + normalizedCompanyName
          ]

          console.log('Trying possible keys:', possibleKeys)
          
          let companyInfo = null
          let matchedKey = null
          for (const key of possibleKeys) {
            // Try exact match first
            if (parsedContent[key]) {
              companyInfo = parsedContent[key]
              matchedKey = key
              break
            }
            // Try case-insensitive match
            const matchingKey = availableKeys.find(k => k.toLowerCase() === key.toLowerCase())
            if (matchingKey) {
              companyInfo = parsedContent[matchingKey]
              matchedKey = matchingKey
              break
            }
          }
          
          if (matchedKey) {
            console.log(`Found match for ${normalizedCompanyName} using key: ${matchedKey}`)
          } else {
            console.log(`No match found for ${normalizedCompanyName}`)
          }
          
          companyInfo = companyInfo || {}
          console.log(`Final info for ${normalizedCompanyName}:`, companyInfo)
          
          return {
            name: company.name,
            url: company.url,
            description: companyInfo.description || '',
            industry: companyInfo.industry || '',
            products_services: companyInfo.products_services || '',
            headquarters: companyInfo.headquarters || '',
            year_founded: companyInfo.year_founded || ''
          }
        })
        console.log('Final processed data:', processed)
        setProcessedData(processed)
      } catch (parseError) {
        console.error('Error parsing API response:', parseError)
        console.error('Content that failed to parse:', content)
        setError('Failed to parse the API response. Please try again.')
      }
      
    } catch (err) {
      console.error('Error extracting information:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Navigation onClear={handleClear} />
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {companies.map((company, index) => (
                <div key={index} className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`company-name-${index}`}>Company Name</Label>
                      <Input
                        id={`company-name-${index}`}
                        value={company.name}
                        onChange={(e) => updateCompany(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`company-url-${index}`}>Company URL (optional)</Label>
                      <Input
                        id={`company-url-${index}`}
                        value={company.url}
                        onChange={(e) => updateCompany(index, 'url', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addCompany}
                  className="flex-1"
                >
                  Add Another Company
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex-1"
                >
                  Upload CSV
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={extractInfo}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Extract Information"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {processedData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Products/Services</TableHead>
                      <TableHead>Headquarters</TableHead>
                      <TableHead>Year Founded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.url}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.industry}</TableCell>
                        <TableCell>{row.products_services}</TableCell>
                        <TableCell>{row.headquarters}</TableCell>
                        <TableCell>{row.year_founded}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <Button onClick={exportToCsv}>Export to CSV</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {result && !processedData.length && (
          <Card>
            <CardHeader>
              <CardTitle>Raw API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap overflow-auto max-h-[400px]">{
                  typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                }</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

