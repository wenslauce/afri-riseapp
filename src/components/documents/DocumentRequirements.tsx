'use client'

import { Country, DocumentUpload } from '@/types'

interface DocumentRequirementsProps {
  country: Country
  documents: DocumentUpload[]
  getDocumentStatus: (documentType: string) => 'uploaded' | 'pending'
}

export default function DocumentRequirements({ 
  country, 
  documents, 
  getDocumentStatus 
}: DocumentRequirementsProps) {
  const requirements = country.document_requirements

  const renderDocumentSection = (title: string, docs: string[], prefix?: string) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {docs.map((doc, index) => {
          const documentType = prefix ? `${prefix}: ${doc}` : doc
          const status = getDocumentStatus(documentType)
          const uploadedDoc = documents.find(d => 
            d.document_type === doc || d.document_type === documentType
          )
          
          return (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`
                  flex-shrink-0 h-4 w-4 rounded-full mr-3
                  ${status === 'uploaded' 
                    ? 'bg-green-500 text-white flex items-center justify-center' 
                    : 'bg-gray-200'
                  }
                `}>
                  {status === 'uploaded' && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${status === 'uploaded' ? 'text-gray-900' : 'text-gray-600'}`}>
                  {doc}
                </span>
              </div>
              
              {status === 'uploaded' && uploadedDoc && (
                <div className="flex items-center text-xs text-green-600">
                  <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Uploaded
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">
          Required Documents
        </h3>
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Country:</strong> {country.name}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Document requirements are specific to your selected country
        </p>
      </div>

      {/* Core Application Documents */}
      {renderDocumentSection(
        'Core Application Documents', 
        requirements.required_documents
      )}

      {/* Company Documents */}
      {renderDocumentSection(
        'Company Documents', 
        requirements.company_documents,
        'Company'
      )}

      {/* Director Documents */}
      {renderDocumentSection(
        'Director Documents', 
        requirements.director_documents,
        'Director'
      )}

      {/* Document Order Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
            <p className="text-sm text-yellow-700 mt-1">
              When submitting your final application, documents will be organized in the order specified in your application form. 
              Please ensure all documents are complete and accurate.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}