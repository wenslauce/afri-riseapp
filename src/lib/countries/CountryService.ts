import { Country } from '@/types'
import { getCountries, getCountryById } from '@/lib/database'

export interface DocumentRequirement {
  id: string
  name: string
  description: string
  category: 'required' | 'company' | 'director'
  required: boolean
  acceptedFormats: string[]
  maxSizeBytes: number
  validationRules?: {
    minPages?: number
    maxPages?: number
    mustContain?: string[]
    expiryDateRequired?: boolean
  }
}

export interface CountryRequirements {
  country: Country
  documentRequirements: DocumentRequirement[]
  totalRequired: number
  categories: {
    required: DocumentRequirement[]
    company: DocumentRequirement[]
    director: DocumentRequirement[]
  }
}

export class CountryService {
  private static instance: CountryService
  private countriesCache: Country[] | null = null
  private requirementsCache: Map<string, CountryRequirements> = new Map()

  static getInstance(): CountryService {
    if (!CountryService.instance) {
      CountryService.instance = new CountryService()
    }
    return CountryService.instance
  }

  async getAllCountries(): Promise<Country[]> {
    if (!this.countriesCache) {
      this.countriesCache = await getCountries()
    }
    return this.countriesCache
  }

  async getCountryRequirements(countryId: string): Promise<CountryRequirements | null> {
    // Check cache first
    if (this.requirementsCache.has(countryId)) {
      return this.requirementsCache.get(countryId)!
    }

    const country = await getCountryById(countryId)
    if (!country) {
      return null
    }

    const requirements = this.parseCountryRequirements(country)
    this.requirementsCache.set(countryId, requirements)
    
    return requirements
  }

  private parseCountryRequirements(country: Country): CountryRequirements {
    const documentRequirements: DocumentRequirement[] = []
    let idCounter = 1

    // Parse required documents
    country.document_requirements.required_documents?.forEach(docName => {
      documentRequirements.push({
        id: `req-${idCounter++}`,
        name: docName,
        description: this.getDocumentDescription(docName),
        category: 'required',
        required: true,
        acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        validationRules: this.getValidationRules(docName)
      })
    })

    // Parse company documents
    country.document_requirements.company_documents?.forEach(docName => {
      documentRequirements.push({
        id: `comp-${idCounter++}`,
        name: docName,
        description: this.getDocumentDescription(docName),
        category: 'company',
        required: true,
        acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSizeBytes: 10 * 1024 * 1024,
        validationRules: this.getValidationRules(docName)
      })
    })

    // Parse director documents
    country.document_requirements.director_documents?.forEach(docName => {
      documentRequirements.push({
        id: `dir-${idCounter++}`,
        name: docName,
        description: this.getDocumentDescription(docName),
        category: 'director',
        required: true,
        acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
        maxSizeBytes: 5 * 1024 * 1024, // 5MB for ID documents
        validationRules: this.getValidationRules(docName)
      })
    })

    const categories = {
      required: documentRequirements.filter(doc => doc.category === 'required'),
      company: documentRequirements.filter(doc => doc.category === 'company'),
      director: documentRequirements.filter(doc => doc.category === 'director')
    }

    return {
      country,
      documentRequirements,
      totalRequired: documentRequirements.filter(doc => doc.required).length,
      categories
    }
  }

  private getDocumentDescription(docName: string): string {
    const descriptions: Record<string, string> = {
      'Application Form': 'Completed loan application form with all required information',
      'Project Summary': 'Detailed summary of the project or business for which funding is sought',
      'Audited Accounts': 'Most recent audited financial statements (last 2-3 years)',
      '2 Year Management Accounts': 'Management accounts for the past 2 years',
      '5 Year Cash Flow Projection': 'Detailed cash flow projections for the next 5 years',
      'Certificate of Incorporation': 'Official certificate of company incorporation',
      'Commercial Register': 'Commercial registration certificate',
      'Commercial Registry': 'Commercial registry certificate',
      'RCCM Registration': 'RCCM (Registre du Commerce et du Crédit Mobilier) registration',
      'Company Registration': 'Official company registration document',
      'Tax Certificate': 'Tax compliance certificate or clearance',
      'Tax Compliance': 'Tax compliance certificate',
      'Tax Clearance': 'Tax clearance certificate',
      'Operating Licenses': 'All relevant business operating licenses',
      'Trading License': 'Trading license or business permit',
      'National ID': 'National identity document of directors/shareholders',
      'Identity Card': 'National identity card',
      'Omang ID': 'Botswana national identity card (Omang)',
      'Citizen Card': 'National citizen identification card',
      'Tax Number': 'Tax identification number certificate'
    }

    return descriptions[docName] || `${docName} - Please provide the required document`
  }

  private getValidationRules(docName: string): DocumentRequirement['validationRules'] {
    const rules: Record<string, DocumentRequirement['validationRules']> = {
      'Audited Accounts': {
        minPages: 5,
        mustContain: ['Balance Sheet', 'Income Statement'],
        expiryDateRequired: false
      },
      'Certificate of Incorporation': {
        minPages: 1,
        mustContain: ['Certificate', 'Incorporation'],
        expiryDateRequired: false
      },
      'National ID': {
        minPages: 1,
        maxPages: 2,
        expiryDateRequired: true
      },
      'Tax Certificate': {
        minPages: 1,
        expiryDateRequired: true
      },
      '5 Year Cash Flow Projection': {
        minPages: 3,
        mustContain: ['Cash Flow', 'Projection']
      }
    }

    return rules[docName]
  }

  validateDocument(
    file: File, 
    requirement: DocumentRequirement
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check file size
    if (file.size > requirement.maxSizeBytes) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(requirement.maxSizeBytes)}`)
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !requirement.acceptedFormats.includes(fileExtension)) {
      errors.push(`File format not accepted. Allowed formats: ${requirement.acceptedFormats.join(', ')}`)
    }

    // Check file name contains document type (basic validation)
    const fileName = file.name.toLowerCase()
    const docNameWords = requirement.name.toLowerCase().split(' ')
    const hasRelevantKeyword = docNameWords.some(word => 
      word.length > 3 && fileName.includes(word)
    )

    if (!hasRelevantKeyword) {
      errors.push(`File name should contain keywords related to "${requirement.name}"`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  getDocumentProgress(
    requirements: CountryRequirements,
    uploadedDocuments: { document_type: string }[]
  ): {
    completed: number
    total: number
    percentage: number
    missing: DocumentRequirement[]
    uploaded: DocumentRequirement[]
  } {
    const uploadedTypes = uploadedDocuments.map(doc => doc.document_type)
    const uploaded = requirements.documentRequirements.filter(req => 
      uploadedTypes.includes(req.name)
    )
    const missing = requirements.documentRequirements.filter(req => 
      !uploadedTypes.includes(req.name)
    )

    const completed = uploaded.length
    const total = requirements.totalRequired
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      completed,
      total,
      percentage,
      missing,
      uploaded
    }
  }

  clearCache(): void {
    this.countriesCache = null
    this.requirementsCache.clear()
  }
}

// Export singleton instance
export const countryService = CountryService.getInstance()