'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Application, UserProfile, DocumentUpload, Country } from '@/types'
import { getCountryById } from '@/lib/database-client'
import ModernDocumentUploadZone from './ModernDocumentUploadZone'
import DocumentList from './DocumentList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight,
  Info
} from 'lucide-react'

interface ModernDocumentUploadManagerProps {
  application: Application
  userProfile: UserProfile | null
  existingDocuments: DocumentUpload[]
}

export default function ModernDocumentUploadManager({ 
  application, 
  userProfile, 
  existingDocuments 
}: ModernDocumentUploadManagerProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<DocumentUpload[]>(existingDocuments)
  const [country, setCountry] = useState<Country | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCountry = async () => {
      if (userProfile?.country_id) {
        try {
          const countryData = await getCountryById(userProfile.country_id)
          setCountry(countryData)
        } catch (error) {
          console.error('Failed to fetch country:', error)
        }
      }
    }
    
    fetchCountry()
  }, [userProfile?.country_id])

  const getRequiredDocuments = () => {
    if (!country) return []
    
    const requirements = country.document_requirements
    const allDocuments = [
      ...requirements.required_documents,
      ...requirements.company_documents.map(doc => `Company: ${doc}`),
      ...requirements.director_documents.map(doc => `Director: ${doc}`)
    ]
    
    return allDocuments
  }

  const handleDocumentUploaded = (document: DocumentUpload) => {
    setDocuments(prev => [...prev, document])
  }

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleContinue = async () => {
    setIsLoading(true)
    try {
      router.push(`/application/${application.id}/payment`)
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const requiredDocuments = getRequiredDocuments()
  const uploadedDocumentTypes = documents.map(doc => doc.document_type)
  const remainingDocuments = requiredDocuments.filter(doc => !uploadedDocumentTypes.includes(doc))
  const completionPercentage = requiredDocuments.length > 0 
    ? Math.round((documents.length / requiredDocuments.length) * 100)
    : 0
  const isComplete = remainingDocuments.length === 0

  if (!country) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading document requirements...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center">
                <FileText className="h-6 w-6 mr-3 text-primary" />
                Document Upload
              </CardTitle>
              <CardDescription>
                Upload the required documents for your loan application
              </CardDescription>
            </div>
            <Badge 
              variant={isComplete ? "default" : "secondary"} 
              className="text-sm"
            >
              {completionPercentage}% Complete
            </Badge>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{documents.length} of {requiredDocuments.length} documents uploaded</span>
              <span>{country.name}</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Required Documents
            </CardTitle>
            <CardDescription>
              Documents required for applications from {country.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Required Documents */}
              {country.document_requirements.required_documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">General Requirements</h4>
                  <div className="space-y-2">
                    {country.document_requirements.required_documents.map((doc) => (
                      <div key={doc} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          {uploadedDocumentTypes.includes(doc) ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className="text-sm">{doc}</span>
                        </div>
                        {uploadedDocumentTypes.includes(doc) && (
                          <Badge variant="outline" className="text-xs">Uploaded</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Documents */}
              {country.document_requirements.company_documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Company Documents</h4>
                  <div className="space-y-2">
                    {country.document_requirements.company_documents.map((doc) => {
                      const fullDocName = `Company: ${doc}`
                      return (
                        <div key={doc} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center space-x-2">
                            {uploadedDocumentTypes.includes(fullDocName) ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                            )}
                            <span className="text-sm">{doc}</span>
                          </div>
                          {uploadedDocumentTypes.includes(fullDocName) && (
                            <Badge variant="outline" className="text-xs">Uploaded</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Director Documents */}
              {country.document_requirements.director_documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3">Director Documents</h4>
                  <div className="space-y-2">
                    {country.document_requirements.director_documents.map((doc) => {
                      const fullDocName = `Director: ${doc}`
                      return (
                        <div key={doc} className="flex items-center justify-between p-2 rounded-lg border">
                          <div className="flex items-center space-x-2">
                            {uploadedDocumentTypes.includes(fullDocName) ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                            )}
                            <span className="text-sm">{doc}</span>
                          </div>
                          {uploadedDocumentTypes.includes(fullDocName) && (
                            <Badge variant="outline" className="text-xs">Uploaded</Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Drag and drop your documents or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ModernDocumentUploadZone
              applicationId={application.id}
              onDocumentUploaded={handleDocumentUploaded}
              availableDocumentTypes={requiredDocuments}
              uploadedDocuments={documents}
            />
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Documents</CardTitle>
            <CardDescription>
              Review and manage your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentList
              documents={documents}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          {isComplete ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All required documents have been uploaded successfully! You can now proceed to the payment step.
                </AlertDescription>
              </Alert>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/application/${application.id}`)}
                >
                  Back to Application
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Continue to Payment'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please upload all required documents before proceeding to the next step. 
                  You have {remainingDocuments.length} document(s) remaining.
                </AlertDescription>
              </Alert>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/application/${application.id}`)}
                >
                  Back to Application
                </Button>
                <Button disabled>
                  Upload Remaining Documents
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
