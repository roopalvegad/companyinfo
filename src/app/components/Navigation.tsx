import { Button } from "@/components/ui/button"

interface NavigationProps {
  onClear: () => void;
}

export default function Navigation({ onClear }: NavigationProps) {
  return (
    <nav className="border-b">
      <div className="container mx-auto py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Company Info Extractor</h1>
        <Button variant="outline" onClick={onClear}>
          Clear All
        </Button>
      </div>
    </nav>
  )
} 