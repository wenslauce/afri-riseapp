'use client'

import { useState, useEffect } from 'react'
import { Country, DocumentUpload } from '@/types'
import { CountryRequirements, DocumentRequirement, countryService } from '@/lib/countries/CountryService'

interface CountryDocumentChecklistProps {
  country: Country
  uploadedDocuments: DocumentUpload[]
  onDocumentSelect: (requirement: DocumentRequirement) => void
  onRequirementsLoad: (requirements: CountryRequirements) => void
}

export default function CountryDocumentChecklist({
  country,
  uploadedDocuments,
  onDocumentSelect,
  onRequirementsLoad
}: CountryDocumentChecklistProps) {
  const [requirements, setRequirements] = useState<CountryRequirements | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCountryRequirements()
  }, [country.id])

  const loadCountryRequirements = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const countryRequirements = await countryService.getCountryRequirements(country.id)
      if (!countryRequirements) {
        throw new Error('Country requirements not found')
      }
      
      setRequirements(countryRequirements)
      onRequirementsLoad(countryRequirements)
    } catch (error) {
      console.error('Failed to load country requirements:', error)
      setError(error instanceof Error ? error.message : 'Failed to load requirements')
    } finally {
      setIsLoading(false)
    }
  }

  const isDocumentUploaded = (requirement: DocumentRequirement): boolean => {
    return uploadedDocuments.some(doc => doc.document_type === requirement.name)
  }

  const getUploadedDocument = (requirement: DocumentRequirement): DocumentUpload | undefined => {
    return uploadedDocuments.find(doc => doc.document_type === requirement.name)
  }

  const getRequirementIcon = (requirement: DocumentRequirement) => {
    const isUploaded = isDocumentUploaded(requirement)
    
    if (isUploaded) {
      return (
        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )
    }

    if (requirement.required) {
      return (
        <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 6a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
        </div>
      )
    }

    return (
      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      </div>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'required':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'company':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        )
      case 'director':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="flex items-center text-red-600 mb-4">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Error Loading Requirements</span>
        </div>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button
          onClick={loadCountryRequirements}
          className="btn-secondary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!requirements) {
    return null
  }

  const progress = countryService.getDocumentProgress(requirements, uploadedDocuments)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Document Requirements - {country.name}
          </h3>
          <p className="text-sm text-gray-500">
            {progress.completed} of {progress.total} required documents uploaded
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{progress.percentage}%</div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Document Categories */}
      <div className="space-y-6">
        {Object.entries(requirements.categories).map(([categoryKey, categoryDocs]) => {
          if (categoryDocs.length === 0) return null

          const categoryName = categoryKey === 'required' ? 'Application Documents' :
                              categoryKey === 'company' ? 'Company Documents' :
                              'Director Documents'

          const uploadedInCategory = categoryDocs.filter(doc => isDocumentUploaded(doc)).length

          return (
            <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(categoryKey)}
                  <h4 className="font-medium text-gray-900">{categoryName}</h4>
                </div>
                <span className="text-sm text-gray-500">
                  {uploadedInCategory}/{categoryDocs.length} uploaded
                </span>
              </div>

              <div className="space-y-3">
                {categoryDocs.map((requirement) => {
                  const isUploaded = isDocumentUploaded(requirement)
                  const uploadedDoc = getUploadedDocument(requirement)

                  return (
                    <div
                      key={requirement.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isUploaded 
                          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => onDocumentSelect(requirement)}
                    >
                      {getRequirementIcon(requirement)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-sm font-medium ${
                            isUploaded ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {requirement.name}
                            {requirement.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </h5>
                          
                          {isUploaded && uploadedDoc && (
                            <span className="text-xs text-green-600 font-medium">
                              Uploaded
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {requirement.description}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>
                            Formats: {requirement.acceptedFormats.join(', ').toUpperCase()}
                          </span>
                          <span>
                            Max size: {Math.round(requirement.maxSizeBytes / (1024 * 1024))}MB
                          </span>
                        </div>

                        {uploadedDoc && (
                          <div className="mt-2 text-xs text-gray-600">
                            <span className="font-medium">File:</span> {uploadedDoc.file_name}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Document Requirements for {country.name}
              </h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Please upload all required documents marked with (*). 
                  Documents must be clear, legible, and in the accepted formats.
                </p>
                {progress.missing.length > 0 && (
                  <p className="mt-1">
                    <strong>Missing:</strong> {progress.missing.length} document(s)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
