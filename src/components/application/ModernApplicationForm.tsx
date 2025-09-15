'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@supabase/supabase-js'
import { UserProfile } from '@/types'
import { createApplication, updateApplication } from '@/lib/database-client'
import { 
  applicationFormSchema, 
  ApplicationFormData,
  employeeCountOptions,
  industryOptions,
  loanTermOptions
} from '@/lib/validation/application-schema'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { 
  Building2, 
  Users, 
  Target, 
  Globe, 
  DollarSign, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle
} from 'lucide-react'

interface ModernApplicationFormProps {
  user: User
  userProfile: UserProfile
}

const SECTIONS = [
  {
    id: 1,
    title: 'Company Information',
    description: 'Tell us about your company',
    icon: Building2,
    fields: ['company_founded_year', 'company_offices', 'industry', 'employee_count', 'business_description']
  },
  {
    id: 2,
    title: 'Business Model',
    description: 'Describe your business approach',
    icon: Target,
    fields: ['business_model', 'competitive_advantage', 'competitors']
  },
  {
    id: 3,
    title: 'Market & Expansion',
    description: 'Your market position and plans',
    icon: Globe,
    fields: ['foreign_markets', 'previous_financing']
  },
  {
    id: 4,
    title: 'Financing Details',
    description: 'Specify your financing needs',
    icon: DollarSign,
    fields: ['financing_purpose', 'project_shovel_ready', 'financing_amount', 'requested_interest_rate', 'loan_term']
  }
]

export default function ModernApplicationForm({ user, userProfile }: ModernApplicationFormProps) {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [draftApplication, setDraftApplication] = useState<any>(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      company_founded_year: new Date().getFullYear(),
      company_offices: '',
      industry: '',
      employee_count: '',
      business_model: '',
      competitive_advantage: '',
      competitors: '',
      foreign_markets: false,
      previous_financing: false,
      financing_purpose: '',
      project_shovel_ready: false,
      financing_amount: 1000000,
      requested_interest_rate: 0,
      loan_term: 60,
      business_description: '',
    },
    mode: 'onChange',
  })

  const { handleSubmit, trigger, watch, formState: { errors, isValid } } = form

  // Auto-save functionality
  const formData = watch()
  useEffect(() => {
    if (!draftApplication) return

    const saveTimer = setTimeout(async () => {
      setAutoSaveStatus('saving')
      try {
        await updateApplication(draftApplication.id, formData)
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 2000)
      } catch (error) {
        setAutoSaveStatus('error')
        console.error('Auto-save failed:', error)
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [formData, draftApplication])

  // Calculate progress
  const getProgress = () => {
    const totalFields = SECTIONS.reduce((acc, section) => acc + section.fields.length, 0)
    const completedFields = Object.entries(formData).filter(([key, value]) => {
      if (typeof value === 'boolean') return true
      if (typeof value === 'number') return value > 0
      if (typeof value === 'string') return value.trim().length > 0
      return false
    }).length
    return Math.round((completedFields / totalFields) * 100)
  }

  const validateCurrentSection = async () => {
    const currentSectionData = SECTIONS.find(s => s.id === currentSection)
    if (!currentSectionData) return false
    
    const fieldsToValidate = currentSectionData.fields as Array<keyof ApplicationFormData>
    return await trigger(fieldsToValidate)
  }

  const handleNext = async () => {
    const isValidSection = await validateCurrentSection()
    if (isValidSection && currentSection < SECTIONS.length) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1)
    }
  }

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true)
    
    try {
      const application = await createApplication({
        user_id: user.id,
        country_id: userProfile.country_id,
        application_data: data,
        status: 'draft'
      })

      router.push(`/application/${application.id}/documents`)
    } catch (error) {
      console.error('Application submission error:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false)
    }
  }

  const currentSectionData = SECTIONS.find(s => s.id === currentSection)
  const SectionIcon = currentSectionData?.icon || Building2

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Loan Application</CardTitle>
              <CardDescription>
                Complete your loan application form with accurate company and project information
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {autoSaveStatus !== 'idle' && (
                <Badge variant={autoSaveStatus === 'saved' ? 'default' : 'secondary'}>
                  {autoSaveStatus === 'saving' && 'Saving...'}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Saved
                    </>
                  )}
                  {autoSaveStatus === 'error' && 'Save Failed'}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentSection} of {SECTIONS.length}</span>
              <span>{getProgress()}% complete</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
          
          {/* Section Navigation */}
          <div className="flex space-x-2 mt-4">
            {SECTIONS.map((section) => (
              <Button
                key={section.id}
                variant={currentSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentSection(section.id)}
                className="flex-1"
              >
                <section.icon className="h-4 w-4 mr-2" />
                {section.title}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <SectionIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{currentSectionData?.title}</CardTitle>
                  <CardDescription>{currentSectionData?.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Section 1: Company Information */}
              {currentSection === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="company_founded_year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Founded Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2020"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || new Date().getFullYear())}
                          />
                        </FormControl>
                        <FormDescription>
                          The year your company was established
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employee_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee count" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employeeCountOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Industry</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="company_offices"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Company Offices</FormLabel>
                        <FormControl>
                          <Input placeholder="Lagos, Abuja, Cairo..." {...field} />
                        </FormControl>
                        <FormDescription>
                          List the cities where your company has offices
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="business_description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Business Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe what your company does..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief overview of your business operations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 2: Business Model */}
              {currentSection === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="business_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Model</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how your company generates revenue..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain your business model, revenue streams, and how you make money
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="competitive_advantage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Competitive Advantage</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What makes your company unique in the market..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe what sets you apart from competitors
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="competitors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Competitors</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List your main competitors and how you differentiate..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Who are your main competitors and how do you compete with them?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 3: Market & Expansion */}
              {currentSection === 3 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="foreign_markets"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Foreign Market Operations
                          </FormLabel>
                          <FormDescription>
                            Does your company operate in foreign markets or plan to expand internationally?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_financing"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Previous Financing
                          </FormLabel>
                          <FormDescription>
                            Has your company received previous financing (loans, investments, etc.)?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Section 4: Financing Details */}
              {currentSection === 4 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="financing_purpose"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purpose of Financing</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how you plan to use the financing..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Explain in detail what you will use the loan for
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="project_shovel_ready"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Shovel-Ready Project
                          </FormLabel>
                          <FormDescription>
                            Is your project ready for immediate implementation?
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="financing_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Financing Amount (USD)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1000000"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Amount you wish to borrow in USD
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requested_interest_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Requested Interest Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="5.5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            Your preferred interest rate (annual)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="loan_term"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Loan Term</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select loan term" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {loanTermOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How long do you need to repay the loan?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentSection === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="text-sm text-muted-foreground">
                  Step {currentSection} of {SECTIONS.length}
                </div>

                {currentSection < SECTIONS.length ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isLoading || !isValid}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                    <Save className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}
