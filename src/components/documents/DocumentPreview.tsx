'use client'

import { useState } from 'react'
import { DocumentUpload } from '@/types'
import { createClient } from '@/utils/supabase/client'

interface DocumentPreviewProps {
  document: DocumentUpload
  isOpen: boolean
  onClose: () => void
}

export default function DocumentPreview({ document, isOpen, onClose }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadPreview = async () => {
    if (previewUrl) return // Already loaded
    
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.storage
        .from('application-documents')
        .createSignedUrl(document.file_path, 3600) // 1 hour expiry

      if (error) {
        throw error
      }

      setPreviewUrl(data.signedUrl)
    } catch (error) {
      console.error('Preview load failed:', error)
      setError('Failed to load document preview')
    } finally {
      setIsLoading(false)
    }
  }

  // Load preview when modal opens
  if (isOpen && !previewUrl && !isLoading && !error) {
    loadPreview()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Document Preview
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {document.file_name} • {document.document_type}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6" style={{ height: '70vh' }}>
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading preview...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                  <button
                    onClick={loadPreview}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-500"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {previewUrl && (
              <div className="h-full">
                <iframe
                  src={previewUrl}
                  className="w-full h-full border border-gray-300 rounded"
                  title={`Preview of ${document.file_name}`}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
