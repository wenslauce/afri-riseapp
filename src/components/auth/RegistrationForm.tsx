'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/auth-client'
import { RegistrationFormData } from '@/types'
import { AfricanCountry } from '@/lib/countries/african-countries'

interface RegistrationFormProps {
  countries: AfricanCountry[]
}

export default function RegistrationForm({ countries }: RegistrationFormProps) {
  const router = useRouter()
  const { signUp } = useSupabaseAuth()
  
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    country_id: '',
    company_name: '',
    contact_person: '',
    official_address: '',
    phone: ''
  })
  
  const [errors, setErrors] = useState<Partial<RegistrationFormData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Account Info, 2: Company Info

  const validateStep1 = () => {
    const newErrors: Partial<RegistrationFormData> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Partial<RegistrationFormData> = {}
    
    if (!formData.country_id) {
      newErrors.country_id = 'Please select your country'
    }
    
    if (!formData.company_name) {
      newErrors.company_name = 'Company name is required'
    }
    
    if (!formData.contact_person) {
      newErrors.contact_person = 'Contact person is required'
    }
    
    if (!formData.official_address) {
      newErrors.official_address = 'Official address is required'
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof RegistrationFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handlePreviousStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Create auth user
      const { user, error: signUpError } = await signUp(formData.email, formData.password)
      
      if (signUpError) {
        throw signUpError
      }
      
      if (user) {
        // Create user profile via API endpoint
        const profileData = {
          userId: user.id,
          country_id: formData.country_id,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          official_address: formData.official_address,
          phone: formData.phone
        }
        
        const response = await fetch('/api/auth/create-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData)
        })
        
        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to create user profile')
        }
        
        // Redirect to email confirmation page
        router.push('/auth/confirm-email')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ email: error instanceof Error ? error.message : 'Registration failed' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={`form-input ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="w-full btn-primary"
          >
            Next: Company Information
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          
          <div className="form-field">
            <label htmlFor="country_id" className="form-label">
              Country
            </label>
            <select
              id="country_id"
              name="country_id"
              required
              className={`form-input ${errors.country_id ? 'border-red-500' : ''}`}
              value={formData.country_id}
              onChange={handleInputChange}
            >
              <option value="">Select your country</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.country_id && (
              <p className="mt-1 text-sm text-red-600">{errors.country_id}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="company_name" className="form-label">
              Company Name
            </label>
            <input
              id="company_name"
              name="company_name"
              type="text"
              required
              className={`form-input ${errors.company_name ? 'border-red-500' : ''}`}
              placeholder="Enter your company name"
              value={formData.company_name}
              onChange={handleInputChange}
            />
            {errors.company_name && (
              <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="contact_person" className="form-label">
              Contact Person
            </label>
            <input
              id="contact_person"
              name="contact_person"
              type="text"
              required
              className={`form-input ${errors.contact_person ? 'border-red-500' : ''}`}
              placeholder="Enter contact person name"
              value={formData.contact_person}
              onChange={handleInputChange}
            />
            {errors.contact_person && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_person}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="official_address" className="form-label">
              Official Address
            </label>
            <textarea
              id="official_address"
              name="official_address"
              required
              className={`form-textarea ${errors.official_address ? 'border-red-500' : ''}`}
              placeholder="Enter your company's official address"
              value={formData.official_address}
              onChange={handleInputChange}
              rows={3}
            />
            {errors.official_address && (
              <p className="mt-1 text-sm text-red-600">{errors.official_address}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="flex-1 btn-secondary"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}