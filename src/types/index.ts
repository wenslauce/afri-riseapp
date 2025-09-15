// User and Profile Types
export interface UserProfile {
  id: string;
  country_id: string;
  company_name: string;
  contact_person: string;
  official_address: string;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Country Types
export interface Country {
  id: string;
  name: string;
  code: string;
  document_requirements: {
    required_documents: string[];
    company_documents: string[];
    director_documents: string[];
  };
  created_at: string;
}

// Re-export AfricanCountry from the countries module for convenience
export type { AfricanCountry } from '@/lib/countries/african-countries';

// Application Types
export interface Application {
  id: string;
  user_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  application_data: ApplicationData;
  created_at: string;
  updated_at: string;
}

export interface ApplicationData {
  company_founded_year: number;
  company_offices: string;
  industry: string;
  employee_count: string;
  business_model: string;
  competitive_advantage: string;
  competitors: string;
  foreign_markets: boolean;
  previous_financing: boolean;
  financing_purpose: string;
  project_shovel_ready: boolean;
  financing_amount: number;
  requested_interest_rate: number;
  loan_term: number;
  business_description?: string;
}

// Document Types
export interface DocumentUpload {
  id: string;
  application_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size: number;
  uploaded_at: string;
  file_url?: string;
}

// Payment Types
export interface PaymentRecord {
  id: string;
  application_id: string;
  payment_gateway: string;
  gateway_transaction_id: string;
  gateway_reference?: string;
  amount: number;
  currency: string;
  status: string;
  paid_at?: string;
  gateway_response?: any;
  created_at: string;
}

// NDA Signature Types
export interface NDASignature {
  id: string;
  application_id: string;
  signature_data: string; // Base64 encoded signature image
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Payment Gateway Interface
export interface PaymentInitParams {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  customerEmail: string;
  customerName: string;
  callbackUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentGateway {
  name: string;
  initializePayment(params: PaymentInitParams): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<PaymentStatus>;
  handleWebhook(payload: any, signature?: string): Promise<WebhookResult>;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  redirectUrl?: string;
  paymentUrl?: string;
  reference?: string;
  error?: string;
  gatewayResponse?: any;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'expired';
  transactionId: string;
  amount?: number;
  currency?: string;
  reference?: string;
  paidAt?: string;
  gatewayReference?: string;
  error?: string;
}

export interface WebhookResult {
  success: boolean;
  transactionId: string;
  status: PaymentStatus['status'];
  shouldUpdateDatabase: boolean;
  error?: string;
}

// Form Types
export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  country_id: string;
  company_name: string;
  contact_person: string;
  official_address: string;
  phone: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// Application Progress Types
export type ApplicationStep = 
  | 'registration' 
  | 'application' 
  | 'documents' 
  | 'payment' 
  | 'nda' 
  | 'completed';

export interface ApplicationProgress {
  current_step: ApplicationStep;
  completed_steps: ApplicationStep[];
  can_proceed: boolean;
}