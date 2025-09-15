'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Country, UserProfile } from '@/types'
import { createUserProfile, updateUserProfile } from '@/lib/database-client'

interface ProfileFormProps {
  user: User
  userProfile: UserProfile | null
  countries: Country[]
}

export default function ProfileForm({ user, userProfile, countries }: ProfileFormProps) {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    country_id: userProfile?.country_id || '',
    company_name: userProfile?.company_name || '',
    contact_person: userProfile?.contact_person || '',
    official_address: userProfile?.official_address || '',
    phone: userProfile?.phone || ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      if (userProfile) {
        // Update existing profile
        await updateUserProfile(user.id, formData)
      } else {
        // Create new profile
        await createUserProfile(user.id, formData)
      }
      
      // Redirect to dashboard
      router.push('/')
    } catch (error) {
      console.error('Profile save error:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to save profile' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={user.email || ''}
            disabled
            className="form-input bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        <div className="form-field">
          <label htmlFor="country_id" className="form-label">
            Country *
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
      </div>

      <div className="form-field">
        <label htmlFor="company_name" className="form-label">
          Company Name *
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
          Contact Person *
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
          Official Address *
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
          Phone Number *
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

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (userProfile ? 'Update Profile' : 'Save Profile')}
        </button>
      </div>
    </form>
  )
}