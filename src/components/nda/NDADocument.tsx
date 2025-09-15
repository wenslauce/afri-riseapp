'use client'

import { useState, useEffect, useRef } from 'react'
import { Application, UserProfile } from '@/types'

interface NDADocumentProps {
  application: Application
  userProfile: UserProfile | null
  onDocumentRead: () => void
}

export default function NDADocument({ application, userProfile, onDocumentRead }: NDADocumentProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const documentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!documentRef.current) return

      const element = documentRef.current
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight

      // Calculate reading progress
      const progress = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100)
      setReadingProgress(progress)

      // Check if scrolled to bottom (with small tolerance)
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      
      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true)
        onDocumentRead()
      }
    }

    const element = documentRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [hasScrolledToBottom, onDocumentRead])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const currentDate = new Date()
  const companyName = userProfile?.company_name || '[Company Name]'
  const contactPerson = userProfile?.contact_person || '[Contact Person]'

  return (
    <div className="space-y-6">
      {/* Reading Progress */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Reading Progress</span>
          <span className="text-sm text-gray-500">{Math.round(readingProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          ></div>
        </div>
        {!hasScrolledToBottom && (
          <p className="text-xs text-gray-500 mt-2">
            Please scroll through the entire document to continue
          </p>
        )}
      </div>

      {/* NDA Document */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Non-Disclosure Agreement</h2>
          <p className="text-sm text-gray-500">Effective Date: {formatDate(currentDate)}</p>
        </div>
        
        <div 
          ref={documentRef}
          className="px-6 py-4 max-h-96 overflow-y-auto prose prose-sm max-w-none"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="space-y-6 text-gray-800 leading-relaxed">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. PARTIES</h3>
              <p>
                This Non-Disclosure Agreement ("Agreement") is entered into on {formatDate(currentDate)} between:
              </p>
              <div className="ml-4 mt-2">
                <p><strong>Disclosing Party:</strong> AfriRise Capital Limited, a financial services company</p>
                <p><strong>Receiving Party:</strong> {companyName}, represented by {contactPerson}</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. PURPOSE</h3>
              <p>
                The parties wish to explore a potential business relationship relating to loan application and financing services. 
                In connection with this purpose, it may be necessary for the Disclosing Party to share certain confidential 
                and proprietary information with the Receiving Party.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. DEFINITION OF CONFIDENTIAL INFORMATION</h3>
              <p>
                "Confidential Information" means any and all non-public, confidential, or proprietary information disclosed 
                by the Disclosing Party to the Receiving Party, including but not limited to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Financial information, business plans, and strategies</li>
                <li>Customer lists, supplier information, and business relationships</li>
                <li>Technical data, processes, and methodologies</li>
                <li>Marketing plans, pricing information, and competitive analyses</li>
                <li>Any other information marked as confidential or that would reasonably be considered confidential</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. OBLIGATIONS OF RECEIVING PARTY</h3>
              <p>The Receiving Party agrees to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Hold all Confidential Information in strict confidence</li>
                <li>Not disclose Confidential Information to any third party without prior written consent</li>
                <li>Use Confidential Information solely for the purpose stated in this Agreement</li>
                <li>Take reasonable precautions to protect the confidentiality of the information</li>
                <li>Not reverse engineer, decompile, or disassemble any technical information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">5. EXCEPTIONS</h3>
              <p>
                The obligations set forth in this Agreement shall not apply to information that:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Is or becomes publicly available through no breach of this Agreement</li>
                <li>Was rightfully known by the Receiving Party prior to disclosure</li>
                <li>Is rightfully received from a third party without breach of any confidentiality obligation</li>
                <li>Is required to be disclosed by law or court order</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">6. RETURN OF INFORMATION</h3>
              <p>
                Upon termination of discussions or upon request by the Disclosing Party, the Receiving Party shall 
                promptly return or destroy all documents, materials, and other tangible manifestations of Confidential 
                Information and all copies thereof.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">7. TERM</h3>
              <p>
                This Agreement shall remain in effect for a period of five (5) years from the date of execution, 
                unless terminated earlier by mutual written consent of the parties.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">8. REMEDIES</h3>
              <p>
                The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the 
                Disclosing Party, for which monetary damages would be inadequate. Therefore, the Disclosing Party 
                shall be entitled to seek equitable relief, including injunction and specific performance, in addition 
                to all other remedies available at law or in equity.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">9. GOVERNING LAW</h3>
              <p>
                This Agreement shall be governed by and construed in accordance with the laws of Kenya, without 
                regard to its conflict of law principles.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">10. ENTIRE AGREEMENT</h3>
              <p>
                This Agreement constitutes the entire agreement between the parties with respect to the subject 
                matter hereof and supersedes all prior and contemporaneous agreements and understandings, whether 
                oral or written, relating to such subject matter.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">11. AMENDMENTS</h3>
              <p>
                This Agreement may only be amended by a written instrument signed by both parties.
              </p>
            </section>

            <section className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-sm text-gray-600 italic">
                By signing below, the parties acknowledge that they have read, understood, and agree to be bound 
                by the terms and conditions of this Non-Disclosure Agreement.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Document Status */}
      <div className={`p-4 rounded-lg border ${
        hasScrolledToBottom 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {hasScrolledToBottom ? (
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              hasScrolledToBottom ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {hasScrolledToBottom 
                ? 'Document review completed' 
                : 'Please scroll through the entire document'
              }
            </p>
            <p className={`text-sm ${
              hasScrolledToBottom ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {hasScrolledToBottom 
                ? 'You can now proceed to sign the agreement' 
                : 'Scroll to the bottom to enable the signing option'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
