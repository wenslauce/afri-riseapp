'use client'

import { useState } from 'react'
import { DocumentRequirement, countryService } from '@/lib/countries/CountryService'

interface DocumentRequirementValidatorProps {
  requirement: DocumentRequirement
  file: File | null
  onValidationResult: (isValid: boolean, errors: string[]) => void
}

export default function DocumentRequirementValidator({
  requirement,
  file,
  onValidationResult
}: DocumentRequirementValidatorProps) {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors: string[]
  } | null>(null)

  const validateFile = (fileToValidate: File) => {
    const result = countryService.validateDocument(fileToValidate, requirement)
    setValidationResult(result)
    onValidationResult(result.isValid, result.errors)
    return result
  }

  // Auto-validate when file changes
  useState(() => {
    if (file) {
      validateFile(file)
    }
  })

  if (!file) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            Select a file to validate against requirements
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* File Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">File Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>
            <span className="ml-2 text-gray-900">{file.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Size:</span>
            <span className="ml-2 text-gray-900">{formatFileSize(file.size)}</span>
          </div>
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 text-gray-900">{file.type || 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-500">Last Modified:</span>
            <span className="ml-2 text-gray-900">
              {new Date(file.lastModified).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Requirement Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Requirements for "{requirement.name}"
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Category:</span>
            <span className="text-gray-900 capitalize">{requirement.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Required:</span>
            <span className={requirement.required ? 'text-red-600' : 'text-gray-900'}>
              {requirement.required ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Accepted Formats:</span>
            <span className="text-gray-900">
              {requirement.acceptedFormats.join(', ').toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Max Size:</span>
            <span className="text-gray-900">
              {formatFileSize(requirement.maxSizeBytes)}
            </span>
          </div>
          
          {requirement.validationRules && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-500 text-xs font-medium">Additional Requirements:</span>
              <ul className="mt-1 text-xs text-gray-600 space-y-1">
                {requirement.validationRules.minPages && (
                  <li>• Minimum {requirement.validationRules.minPages} page(s)</li>
                )}
                {requirement.validationRules.maxPages && (
                  <li>• Maximum {requirement.validationRules.maxPages} page(s)</li>
                )}
                {requirement.validationRules.mustContain && (
                  <li>• Must contain: {requirement.validationRules.mustContain.join(', ')}</li>
                )}
                {requirement.validationRules.expiryDateRequired && (
                  <li>• Must have valid expiry date</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className={`border rounded-lg p-4 ${
          validationResult.isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {validationResult.isValid ? (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h4 className={`text-sm font-medium ${
                validationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.isValid ? 'File Validation Passed' : 'File Validation Failed'}
              </h4>
              
              {!validationResult.isValid && validationResult.errors.length > 0 && (
                <div className="mt-2">
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.isValid && (
                <p className="mt-1 text-sm text-green-700">
                  The file meets all requirements and can be uploaded.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Validation Checklist */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Validation Checklist</h4>
        <div className="space-y-2">
          <ValidationCheckItem
            label="File format is accepted"
            isValid={file && requirement.acceptedFormats.includes(
              file.name.split('.').pop()?.toLowerCase() || ''
            )}
          />
          <ValidationCheckItem
            label="File size is within limits"
            isValid={file && file.size <= requirement.maxSizeBytes}
          />
          <ValidationCheckItem
            label="File name is relevant"
            isValid={file && requirement.name.toLowerCase().split(' ').some(word => 
              word.length > 3 && file.name.toLowerCase().includes(word)
            )}
          />
          {requirement.validationRules?.expiryDateRequired && (
            <ValidationCheckItem
              label="Document has expiry date (manual verification required)"
              isValid={null} // Manual verification
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface ValidationCheckItemProps {
  label: string
  isValid: boolean | null
}

function ValidationCheckItem({ label, isValid }: ValidationCheckItemProps) {
  return (
    <div className="flex items-center space-x-2">
      {isValid === true && (
        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {isValid === false && (
        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
      {isValid === null && (
        <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-sm ${
        isValid === true ? 'text-green-700' :
        isValid === false ? 'text-red-700' :
        'text-yellow-700'
      }`}>
        {label}
      </span>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
