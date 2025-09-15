'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/utils/supabase/client'
import { DocumentUpload } from '@/types'
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface ModernDocumentUploadZoneProps {
  applicationId: string
  onDocumentUploaded: (document: DocumentUpload) => void
  availableDocumentTypes: string[]
  uploadedDocuments: DocumentUpload[]
  className?: string
}

interface UploadingFile {
  file: File
  progress: number
  error?: string
  documentType: string
}

export default function ModernDocumentUploadZone({
  applicationId,
  onDocumentUploaded,
  availableDocumentTypes,
  uploadedDocuments,
  className
}: ModernDocumentUploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const supabase = createClient()

  // Get remaining document types that haven't been uploaded yet
  const getRemainingDocumentTypes = () => {
    const uploadedTypes = uploadedDocuments.map(doc => doc.document_type)
    return availableDocumentTypes.filter(type => !uploadedTypes.includes(type))
  }

  const remainingDocumentTypes = getRemainingDocumentTypes()

  const validateFile = (file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed'
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return 'File size must be less than 10MB'
    }
    
    return null
  }

  const uploadFile = async (file: File, documentType: string) => {
    const fileId = `${Date.now()}-${file.name}`
    
    // Add to uploading files
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      documentType
    }
    
    setUploadingFiles(prev => [...prev, uploadingFile])

    try {
      // Get current user ID for file path
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }
      
      // Create file path with user ID as first folder (required by storage policy)
      const filePath = `${user.id}/${applicationId}/${documentType}/${fileId}`
      
      // Upload to Supabase Storage with progress
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('application-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Update progress to 50% after upload
      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, progress: 50 } : f
      ))

      // Create document record in database
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          document_type: documentType,
          file_path: uploadData.path,
          file_name: file.name,
          file_size: file.size
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update progress to 100%
      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, progress: 100 } : f
      ))

      // Remove from uploading files after delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.file !== file))
      }, 1000)

      // Notify parent component
      onDocumentUploaded(result.document)

    } catch (error) {
      console.error('Upload error:', error)
      
      // Update error state
      setUploadingFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ))
    }
  }

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file))
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setErrors([])

    if (!selectedDocumentType) {
      setErrors(['Please select a document type first'])
      return
    }

    acceptedFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        setErrors(prev => [...prev, `${file.name}: ${error}`])
        return
      }

      uploadFile(file, selectedDocumentType)
    })

    // Reset selected document type if only one document type per type is allowed
    setSelectedDocumentType('')
  }, [selectedDocumentType])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: !selectedDocumentType || remainingDocumentTypes.length === 0
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Document Type Selection */}
      {remainingDocumentTypes.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Type</label>
          <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type to upload" />
            </SelectTrigger>
            <SelectContent>
              {remainingDocumentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload Zone */}
      {remainingDocumentTypes.length > 0 ? (
        <Card 
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50",
            isDragActive && "border-primary bg-primary/5",
            !selectedDocumentType && "opacity-50 cursor-not-allowed",
            selectedDocumentType && "border-muted-foreground/25 hover:bg-muted/50"
          )}
        >
          <input {...getInputProps()} />
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className={cn(
              "mx-auto h-12 w-12 rounded-full flex items-center justify-center mb-4",
              isDragActive ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
            )}>
              <Upload className="h-6 w-6" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              {selectedDocumentType ? `Upload ${selectedDocumentType}` : 'Select Document Type'}
            </h3>
            
            {selectedDocumentType ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {isDragActive
                    ? "Drop your PDF file here"
                    : "Drag and drop your PDF file here, or click to browse"
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  Only PDF files up to 10MB are allowed
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Please select a document type first
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All required documents have been uploaded successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Uploading Files</h4>
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <File className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {uploadingFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(uploadingFile.file.size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {uploadingFile.documentType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {uploadingFile.error ? (
                      <Badge variant="destructive">Failed</Badge>
                    ) : uploadingFile.progress === 100 ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {uploadingFile.progress}%
                        </span>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadingFile(uploadingFile.file)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {!uploadingFile.error && uploadingFile.progress < 100 && (
                  <Progress value={uploadingFile.progress} className="h-2" />
                )}
                
                {uploadingFile.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {uploadingFile.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
