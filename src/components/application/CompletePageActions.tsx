'use client'

import Link from 'next/link'

export default function CompletePageActions() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
      <Link
        href="/dashboard"
        className="btn-primary"
      >
        Go to Dashboard
      </Link>
      
      <button
        onClick={handlePrint}
        className="btn-secondary"
      >
        Print Summary
      </button>
    </div>
  )
}
