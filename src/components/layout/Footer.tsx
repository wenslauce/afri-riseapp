'use client'

import Link from 'next/link'
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const footerSections = [
  {
    title: 'Services',
    links: [
      { title: 'Business Loans', href: '#' },
      { title: 'Equipment Financing', href: '#' },
      { title: 'Working Capital', href: '#' },
      { title: 'Trade Finance', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { title: 'About Us', href: '#' },
      { title: 'Our Team', href: '#' },
      { title: 'Careers', href: '#' },
      { title: 'Press', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { title: 'Help Center', href: '#' },
      { title: 'Contact Support', href: '#' },
      { title: 'Documentation', href: '#' },
      { title: 'System Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { title: 'Privacy Policy', href: '#' },
      { title: 'Terms of Service', href: '#' },
      { title: 'Cookie Policy', href: '#' },
      { title: 'Compliance', href: '#' },
    ],
  },
]

const socialLinks = [
  {
    name: 'Facebook',
    href: '#',
    icon: Facebook,
  },
  {
    name: 'Twitter',
    href: '#',
    icon: Twitter,
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: Linkedin,
  },
]

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company info */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Building2 className="h-6 w-6" />
                <span className="font-bold text-lg">Afri-Rise Equity Limited</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your trusted partner for financing solutions across Africa. We provide 
                innovative loan products designed to help businesses grow and thrive.
              </p>
              
              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>support@afri-rise.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Nairobi, Kenya</span>
                </div>
              </div>

              {/* Social links */}
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Button
                      key={social.name}
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <Link href={social.href}>
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{social.name}</span>
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Footer sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Bottom footer */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>&copy; 2024 Afri-Rise Equity Limited. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="py-8 border-t">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-semibold text-foreground mb-2">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get the latest updates on loan products and financial insights.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
