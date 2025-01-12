'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CompanyForm() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Company Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-4">
            {/* File upload will go here */}
          </div>
          <Button 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Extract Information"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 