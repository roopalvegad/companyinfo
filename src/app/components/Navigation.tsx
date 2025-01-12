import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Navigation() {
  return (
    <nav className="border-b mb-6 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Company Info Extractor</h1>
        <ul className="flex gap-4">
          <li>
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
          </li>
          <li>
            <Button variant="ghost" asChild>
              <Link href="/results">Results</Link>
            </Button>
          </li>
        </ul>
      </div>
    </nav>
  )
} 