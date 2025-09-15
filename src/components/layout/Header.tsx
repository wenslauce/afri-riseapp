'use client'

import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              <Building2 className="h-6 w-6" />
              <span className="hidden sm:inline-block">Afri-Rise Equity Limited</span>
              <span className="sm:hidden">Afri-Rise</span>
            </Link>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
