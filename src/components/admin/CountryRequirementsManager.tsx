'use client'

import { useState, useEffect } from 'react'
import { Country } from '@/types'
import { countryService, CountryRequirements, DocumentRequirement } from '@/lib/countries/CountryService'
import { getCountries } from '@/lib/database-client'

interface CountryRequirementsManagerProps {
  onSave?: (countryId: string, requirements: any) => void
}

export default function CountryRequirementsManager({ onSave }: CountryRequirementsManagerProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [requirements, setRequirements] = useState<CountryRequirements | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    loadCountries()
  }, [])

  const loadCountries = async () => {
    try {
      setIsLoading(true)
      const countriesData = await getCountries()
      setCountries(countriesData)
      if (countriesData.length > 0) {
        setSelectedCountry(countriesData[0])
      }
    } catch (error) {
      console.error('Failed to load countries:', error)
      setError('Failed to load countries')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCountry) {
      loadCountryRequirements(selectedCountry.id)
    }
  }, [selectedCountry])

  const loadCountryRequirements = async (countryId: string) => {
    try {
      const countryRequirements = await countryService.getCountryRequirements(countryId)
      setRequirements(countryRequirements)
    } catch (error) {
      console.error('Failed to load country requirements:', error)
      setError('Failed to load country requirements')
    }
  }

  const handleSaveRequirements = async () => {
    if (!selectedCountry || !requirements) return

    try {
      setIsSaving(true)
      
      // Convert requirements back to the database format
      const dbFormat = {
        required_documents: requirements.categories.required.map(doc => doc.name),
        company_documents: requirements.categories.company.map(doc => doc.name),
        director_documents: requirements.categories.director.map(doc => doc.name)
      }

      // Call the onSave callback if provided
      if (onSave) {
        await onSave(selectedCountry.id, dbFormat)
      }

      // Clear cache to force reload
      countryService.clearCache()
      await loadCountryRequirements(selectedCountry.id)
      
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save requirements:', error)
      setError('Failed to save requirements')
    } finally {
      setIsSaving(false)
    }
  }

  const addDocumentRequirement = (category: 'required' | 'company' | 'director') => {
    if (!requirements) return

    const newDoc: DocumentRequirement = {
      id: `new-${Date.now()}`,
      name: 'New Document',
      description: 'Please provide description',
      category,
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeBytes: 10 * 1024 * 1024
    }

    const updatedRequirements = {
      ...requirements,
      categories: {
        ...requirements.categories,
        [category]: [...requirements.categories[category], newDoc]
      },
      documentRequirements: [...requirements.documentRequirements, newDoc]
    }

    setRequirements(updatedRequirements)
  }

  const removeDocumentRequirement = (docId: string) => {
    if (!requirements) return

    const updatedRequirements = {
      ...requirements,
      documentRequirements: requirements.documentRequirements.filter(doc => doc.id !== docId),
      categories: {
        required: requirements.categories.required.filter(doc => doc.id !== docId),
        company: requirements.categories.company.filter(doc => doc.id !== docId),
        director: requirements.categories.director.filter(doc => doc.id !== docId)
      }
    }

    setRequirements(updatedRequirements)
  }

  const updateDocumentRequirement = (docId: string, updates: Partial<DocumentRequirement>) => {
    if (!requirements) return

    const updateDoc = (doc: DocumentRequirement) => 
      doc.id === docId ? { ...doc, ...updates } : doc

    const updatedRequirements = {
      ...requirements,
      documentRequirements: requirements.documentRequirements.map(updateDoc),
      categories: {
        required: requirements.categories.required.map(updateDoc),
        company: requirements.categories.company.map(updateDoc),
        director: requirements.categories.director.map(updateDoc)
      }
    }

    setRequirements(updatedRequirements)
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Country Requirements Manager
            </h2>
            <p className="text-gray-600">
              Manage document requirements for each African country
            </p>
          </div>
          <div className="flex space-x-3">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRequirements}
                  className="btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="btn-primary"
              >
                Edit Requirements
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Country Selector */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Country</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedCountry?.id === country.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{country.name}</div>
                <div className="text-sm text-gray-500">{country.code}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Requirements Editor */}
        <div className="lg:col-span-3">
          {selectedCountry && requirements ? (
            <div className="space-y-6">
              {/* Country Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedCountry.name} ({selectedCountry.code})
                </h3>
                <p className="text-gray-600">
                  Total Requirements: {requirements.totalRequired}
                </p>
              </div>

              {/* Document Categories */}
              {Object.entries(requirements.categories).map(([categoryKey, categoryDocs]) => {
                const categoryName = categoryKey === 'required' ? 'Application Documents' :
                                   categoryKey === 'company' ? 'Company Documents' :
                                   'Director Documents'

                return (
                  <div key={categoryKey} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-gray-900">
                        {categoryName} ({categoryDocs.length})
                      </h4>
                      {editMode && (
                        <button
                          onClick={() => addDocumentRequirement(categoryKey as any)}
                          className="btn-secondary text-sm"
                        >
                          Add Document
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {categoryDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          {editMode ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-3">
                                  <input
                                    type="text"
                                    value={doc.name}
                                    onChange={(e) => updateDocumentRequirement(doc.id, { name: e.target.value })}
                                    className="form-input w-full"
                                    placeholder="Document name"
                                  />
                                  <textarea
                                    value={doc.description}
                                    onChange={(e) => updateDocumentRequirement(doc.id, { description: e.target.value })}
                                    className="form-textarea w-full"
                                    rows={2}
                                    placeholder="Document description"
                                  />
                                </div>
                                <button
                                  onClick={() => removeDocumentRequirement(doc.id)}
                                  className="ml-3 text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <h5 className="font-medium text-gray-900">{doc.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <span>Formats: {doc.acceptedFormats.join(', ')}</span>
                                <span>Max: {Math.round(doc.maxSizeBytes / (1024 * 1024))}MB</span>
                                <span className={doc.required ? 'text-red-600' : 'text-gray-500'}>
                                  {doc.required ? 'Required' : 'Optional'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {categoryDocs.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No documents in this category
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-8 text-gray-500">
                Select a country to view and edit requirements
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
