import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="mb-4">
      <ul className="flex space-x-4">
        <li>
          <Link href="/" className="text-blue-500 hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link href="/config" className="text-blue-500 hover:underline">
            Configuration
          </Link>
        </li>
        <li>
          <Link href="/results" className="text-blue-500 hover:underline">
            Results
          </Link>
        </li>
      </ul>
    </nav>
  )
}

