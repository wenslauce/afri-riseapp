import { z } from "zod"

// Application form validation schema
export const applicationFormSchema = z.object({
  // Company Information Section
  company_founded_year: z
    .number()
    .min(1800, "Please enter a valid founding year")
    .max(new Date().getFullYear(), "Founding year cannot be in the future"),
  
  company_offices: z
    .string()
    .min(2, "Please specify cities where your company has offices")
    .max(500, "Company offices description is too long"),
  
  industry: z
    .string()
    .min(2, "Please specify your industry")
    .max(100, "Industry name is too long"),
  
  employee_count: z
    .string()
    .min(1, "Please specify the number of employees"),
  
  business_description: z
    .string()
    .optional(),

  // Business Model Section
  business_model: z
    .string()
    .min(10, "Please provide a detailed description of your business model (minimum 10 characters)")
    .max(2000, "Business model description is too long"),
  
  competitive_advantage: z
    .string()
    .min(10, "Please describe your competitive advantage (minimum 10 characters)")
    .max(1000, "Competitive advantage description is too long"),
  
  competitors: z
    .string()
    .min(5, "Please list your main competitors")
    .max(500, "Competitors list is too long"),

  // Market & Expansion Section
  foreign_markets: z.boolean(),
  
  previous_financing: z.boolean(),

  // Financing Details Section
  financing_purpose: z
    .string()
    .min(10, "Please describe the purpose of financing (minimum 10 characters)")
    .max(1000, "Financing purpose description is too long"),
  
  project_shovel_ready: z.boolean(),
  
  financing_amount: z
    .number()
    .min(10000, "Minimum financing amount is $10,000")
    .max(100000000, "Maximum financing amount is $100,000,000"),
  
  requested_interest_rate: z
    .number()
    .min(0, "Interest rate cannot be negative")
    .max(50, "Interest rate seems unreasonably high"),
  
  loan_term: z
    .number()
    .min(1, "Minimum loan term is 1 month")
    .max(360, "Maximum loan term is 30 years (360 months)"),
})

// Type inference from schema
export type ApplicationFormData = z.infer<typeof applicationFormSchema>

// Individual section schemas for step-by-step validation
export const companyInfoSchema = applicationFormSchema.pick({
  company_founded_year: true,
  company_offices: true,
  industry: true,
  employee_count: true,
  business_description: true,
})

export const businessModelSchema = applicationFormSchema.pick({
  business_model: true,
  competitive_advantage: true,
  competitors: true,
})

export const marketExpansionSchema = applicationFormSchema.pick({
  foreign_markets: true,
  previous_financing: true,
})

export const financingDetailsSchema = applicationFormSchema.pick({
  financing_purpose: true,
  project_shovel_ready: true,
  financing_amount: true,
  requested_interest_rate: true,
  loan_term: true,
})

// Employee count options
export const employeeCountOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-1000", label: "201-1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
]

// Industry options
export const industryOptions = [
  { value: "agriculture", label: "Agriculture & Farming" },
  { value: "automotive", label: "Automotive" },
  { value: "construction", label: "Construction & Real Estate" },
  { value: "education", label: "Education & Training" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "finance", label: "Financial Services" },
  { value: "food", label: "Food & Beverage" },
  { value: "healthcare", label: "Healthcare & Medical" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "mining", label: "Mining & Extraction" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "technology", label: "Technology & Software" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "other", label: "Other" },
]

// Loan term options (in months)
export const loanTermOptions = [
  { value: 6, label: "6 months" },
  { value: 12, label: "1 year" },
  { value: 24, label: "2 years" },
  { value: 36, label: "3 years" },
  { value: 48, label: "4 years" },
  { value: 60, label: "5 years" },
  { value: 84, label: "7 years" },
  { value: 120, label: "10 years" },
  { value: 180, label: "15 years" },
  { value: 240, label: "20 years" },
  { value: 300, label: "25 years" },
  { value: 360, label: "30 years" },
]
