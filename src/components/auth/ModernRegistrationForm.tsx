'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/auth-client'
import { RegistrationFormData } from '@/types'
import { Eye, EyeOff, Mail, Lock, User, Building, MapPin, Phone, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

interface Country {
  id: string
  name: string
  code: string
}

export default function ModernRegistrationForm() {
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [step, setStep] = useState(1) // 1: Account Info, 2: Company Info
  const [countries, setCountries] = useState<Country[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)

  // Load countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('/api/countries')
        if (response.ok) {
          const data = await response.json()
          setCountries(data.countries)
        } else {
          console.error('Failed to fetch countries')
        }
      } catch (error) {
        console.error('Error fetching countries:', error)
      } finally {
        setLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof RegistrationFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user makes selection
    if (errors[name as keyof RegistrationFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep2()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        {
          country_id: formData.country_id,
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          official_address: formData.official_address,
          phone: formData.phone
        }
      )
      
      if (result.error) {
        if (result.error.includes('email')) {
          setStep(1)
          setErrors({ email: result.error })
        } else {
          setErrors({ country_id: result.error })
        }
        return
      }

      if (result.user) {
        router.push('/auth/confirm-email')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ country_id: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const progressPercentage = (step / 2) * 100

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? 'Account Information' : 'Company Information'}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {step === 1 ? (
        // Step 1: Account Information
        <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a secure password"
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            Continue to Company Information
          </Button>
        </form>
      ) : (
        // Step 2: Company Information  
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country_id}
              onValueChange={(value) => handleSelectChange('country_id', value)}
              disabled={isLoading || loadingCountries}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select your country" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country_id && (
              <p className="text-sm text-destructive">{errors.country_id}</p>
            )}
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Enter your company name"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name}</p>
            )}
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contact_person"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {errors.contact_person && (
              <p className="text-sm text-destructive">{errors.contact_person}</p>
            )}
          </div>

          {/* Official Address */}
          <div className="space-y-2">
            <Label htmlFor="official_address">Official Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="official_address"
                name="official_address"
                value={formData.official_address}
                onChange={handleInputChange}
                placeholder="Enter company's official address"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {errors.official_address && (
              <p className="text-sm text-destructive">{errors.official_address}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1"
              disabled={isLoading}
            >
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      )}

      <Separator />

      {/* Alternative Actions */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={() => {
            // Switch to login tab - this will be handled by parent component
            const loginTab = document.querySelector('[data-state="inactive"][data-value="login"]') as HTMLElement
            loginTab?.click()
          }}
        >
          Sign in
        </Button>
      </div>
    </div>
  )
}
