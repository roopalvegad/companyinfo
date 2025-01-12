'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { extractCompanyInfo } from '@/lib/perplexity'
import { Label } from './ui/label'

export default function CompanyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [companies, setCompanies] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    
    try {
      console.log('Processing companies input:', companies);
      const companyList = companies
        .split('\n')
        .map(company => company.trim())
        .filter(company => company.length > 0)

      console.log('Processed company list:', companyList);

      if (companyList.length === 0) {
        throw new Error('Please enter at least one company name')
      }

      const data = await extractCompanyInfo(companyList)
      console.log('Received API response:', data);
      setResult(data.choices[0].message.content)
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Company Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="companies">Enter Company Names (one per line)</Label>
              <Textarea
                id="companies"
                placeholder="Enter company names here, one per line (e.g. Apple Inc.)"
                value={companies}
                onChange={(e) => setCompanies(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {result && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap overflow-auto max-h-[400px]">{
                typeof result === 'string' ? result : JSON.stringify(result, null, 2)
              }</pre>
            </div>
          )}
          <Button 
            className="w-full" 
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? "Processing..." : "Extract Information"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 