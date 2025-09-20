import { z } from "zod"

// Payment form validation schema
export const paymentFormSchema = z.object({
  // Customer Information
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email is too short")
    .max(255, "Email is too long"),
  
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number is too long")
    .regex(/^[\+]?[1-9][\d]{9,18}$/, "Please enter a valid phone number"),

  // Address Information
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(255, "Address is too long"),
  
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City name is too long"),
  
  country_code: z
    .string()
    .length(2, "Country code must be 2 characters")
    .regex(/^[A-Z]{2}$/, "Country code must be uppercase letters"),

  // Payment Gateway Selection
  payment_gateway: z
    .string()
    .min(1, "Please select a payment gateway"),

  // Currency Selection
  payment_currency: z
    .string()
    .length(3, "Please select a valid currency"),

  // Terms and Conditions
  accept_terms: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms and conditions"),

  // Optional: Payment method within gateway
  payment_method: z
    .string()
    .optional(),
})

// Type inference from schema
export type PaymentFormData = z.infer<typeof paymentFormSchema>

// Country options (major African countries supported by Paystack)
export const countryOptions = [
  { value: "NG", label: "Nigeria" },
  { value: "GH", label: "Ghana" },
  { value: "ZA", label: "South Africa" },
  { value: "KE", label: "Kenya" },
  { value: "EG", label: "Egypt" },
  { value: "MA", label: "Morocco" },
  { value: "TN", label: "Tunisia" },
  { value: "DZ", label: "Algeria" },
  { value: "ET", label: "Ethiopia" },
  { value: "UG", label: "Uganda" },
  { value: "TZ", label: "Tanzania" },
  { value: "RW", label: "Rwanda" },
  { value: "SN", label: "Senegal" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "MW", label: "Malawi" },
  { value: "BW", label: "Botswana" },
  { value: "ZW", label: "Zimbabwe" },
  { value: "ZM", label: "Zambia" },
  { value: "NA", label: "Namibia" },
  { value: "MU", label: "Mauritius" },
  { value: "SC", label: "Seychelles" },
  { value: "MZ", label: "Mozambique" },
  { value: "AO", label: "Angola" },
  { value: "CD", label: "Democratic Republic of Congo" },
  { value: "CM", label: "Cameroon" },
  { value: "BF", label: "Burkina Faso" },
  { value: "ML", label: "Mali" },
  { value: "NE", label: "Niger" },
  { value: "TD", label: "Chad" },
  { value: "LY", label: "Libya" },
  { value: "SD", label: "Sudan" },
  { value: "SS", label: "South Sudan" },
  { value: "ER", label: "Eritrea" },
  { value: "DJ", label: "Djibouti" },
  { value: "SO", label: "Somalia" },
  { value: "MG", label: "Madagascar" },
  { value: "KM", label: "Comoros" },
  { value: "CV", label: "Cape Verde" },
  { value: "ST", label: "São Tomé and Príncipe" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "GA", label: "Gabon" },
  { value: "CG", label: "Republic of Congo" },
  { value: "CF", label: "Central African Republic" },
  { value: "LR", label: "Liberia" },
  { value: "SL", label: "Sierra Leone" },
  { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GM", label: "Gambia" },
  { value: "LS", label: "Lesotho" },
  { value: "SZ", label: "Eswatini" },
  { value: "BI", label: "Burundi" },
  { value: "DJ", label: "Djibouti" },
]

// Payment gateway options
export const paymentGatewayOptions = [
  {
    value: "paystack",
    label: "Paystack",
    description: "Pay with card, bank transfer, or mobile money. USD payments automatically converted to KES for Kenya-based settlement.",
    currencies: ["NGN", "USD", "GHS", "ZAR", "KES"],
    countries: ["NG", "GH", "ZA", "KE"],
    autoConversion: {
      "USD": "KES" // USD payments are auto-converted to KES for settlement
    }
  },
  {
    value: "pesapal",
    label: "Pesapal",
    description: "Popular East African payment gateway. Supports M-Pesa, Airtel Money, and cards. Optimized for Kenya.",
    currencies: ["KES", "USD"],
    countries: ["KE", "UG", "TZ", "RW"],
    autoConversion: {
      "USD": "KES" // USD payments are auto-converted to KES
    },
    features: ["M-Pesa", "Airtel Money", "Credit Cards", "Bank Transfer"]
  },
  // Future gateways can be added here
  // {
  //   value: "flutterwave",
  //   label: "Flutterwave",
  //   description: "Pay with multiple options across Africa",
  //   currencies: ["NGN", "USD", "GHS", "KES", "UGX", "TZS"],
  //   countries: ["NG", "GH", "KE", "UG", "TZ", "ZA"]
  // }
]

// Currency options with conversion info
export const currencyOptions = [
  { 
    value: "USD", 
    label: "US Dollar ($)", 
    symbol: "$",
    convertedTo: "KES",
    conversionNote: "Automatically converted to KES for settlement"
  },
  { 
    value: "KES", 
    label: "Kenyan Shilling (KSh)", 
    symbol: "KSh",
    isLocal: true 
  },
  { 
    value: "NGN", 
    label: "Nigerian Naira (₦)", 
    symbol: "₦" 
  },
  { 
    value: "GHS", 
    label: "Ghanaian Cedi (GH₵)", 
    symbol: "GH₵" 
  },
  { 
    value: "ZAR", 
    label: "South African Rand (R)", 
    symbol: "R" 
  }
]

// Currency formatting helper
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Convert amount to lowest currency unit (cents for USD, kobo for NGN, etc.)
export const convertToLowestUnit = (amount: number, currency: string): number => {
  switch (currency) {
    case "JPY":
    case "KRW":
      return Math.round(amount) // No decimal places
    default:
      return Math.round(amount * 100) // Convert to cents/kobo
  }
}

// Convert from lowest currency unit back to main unit
export const convertFromLowestUnit = (amount: number, currency: string): number => {
  switch (currency) {
    case "JPY":
    case "KRW":
      return amount // No conversion needed
    default:
      return amount / 100 // Convert from cents/kobo
  }
}
