'use client'

import { useState } from 'react'
import { DocumentUpload } from '@/types'
import { createClient } from '@/utils/supabase/client'
import { deleteDocument } from '@/lib/database-client'
import DocumentPreview from './DocumentPreview'

interface DocumentListProps {
  documents: DocumentUpload[]
  onDocumentDeleted: (documentId: string) => void
  isLoading: boolean
}

export default function DocumentList({ 
  documents, 
  onDocumentDeleted, 
  isLoading 
}: DocumentListProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  const [previewDocument, setPreviewDocument] = useState<DocumentUpload | null>(null)
  const supabase = createClient()

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async (doc: DocumentUpload) => {
    setDownloadingIds(prev => new Set(prev).add(doc.id))
    
    try {
      const { data, error } = await supabase.storage
        .from('application-documents')
        .download(doc.file_path)

      if (error) {
        throw error
      }

      // Create download link
      const url = URL.createObjectURL(data)
      const a = window.document.createElement('a')
      a.href = url
      a.download = doc.file_name
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download document. Please try again.')
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(doc.id)
        return newSet
      })
    }
  }

  const handleDelete = async (document: DocumentUpload) => {
    if (!confirm(`Are you sure you want to delete "${document.file_name}"?`)) {
      return
    }

    setDeletingIds(prev => new Set(prev).add(document.id))
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('application-documents')
        .remove([document.file_path])

      if (storageError) {
        console.warn('Storage deletion failed:', storageError)
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      await deleteDocument(document.id)
      onDocumentDeleted(document.id)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete document. Please try again.')
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(document.id)
        return newSet
      })
    }
  }

  const getDocumentIcon = (fileName: string) => {
    if (fileName.toLowerCase().endsWith('.pdf')) {
      return (
        <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      )
    }
    return (
      <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents uploaded</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload your first document using the upload area above.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents</h3>
        <p className="text-sm text-gray-600">{documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {documents.map((document) => (
          <div key={document.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getDocumentIcon(document.file_name)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {document.file_name}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{document.document_type}</span>
                    <span>•</span>
                    <span>{formatFileSize(document.file_size)}</span>
                    <span>•</span>
                    <span>Uploaded {formatDate(document.uploaded_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewDocument(document)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview
                </button>
                
                <button
                  onClick={() => handleDownload(document)}
                  disabled={downloadingIds.has(document.id)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {downloadingIds.has(document.id) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleDelete(document)}
                  disabled={deletingIds.has(document.id)}
                  className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingIds.has(document.id) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  )
}