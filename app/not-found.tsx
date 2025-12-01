import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light-gray flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-hero font-heading text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for could not be found.
        </p>
        <Link 
          href="/" 
          className="btn-primary inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}