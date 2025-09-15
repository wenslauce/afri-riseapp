# API Documentation

## Overview

This document provides comprehensive documentation for the AfriRise Capital Loan Application System API. The API follows REST principles and uses JSON for data exchange.

## Base URL

```
Production: https://app.afri-rise.com/api
Development: http://localhost:3000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Getting a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token-here",
    "expires_at": 1640995200
  }
}
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited:
- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "company_name": "Example Company Ltd",
  "contact_person": "John Doe",
  "country_id": "kenya"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "message": "Registration successful"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number
- `company_name`: Required, 2-100 characters
- `contact_person`: Required, 2-50 characters
- `country_id`: Must be valid country ID

#### Login User

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token",
    "expires_at": 1640995200
  }
}
```

#### Logout User

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "success": true,
  "session": {
    "access_token": "new-jwt-token",
    "expires_at": 1640995200
  }
}
```

### User Profile

#### Get User Profile

```http
GET /api/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "user-123",
    "email": "user@example.com",
    "company_name": "Example Company Ltd",
    "contact_person": "John Doe",
    "country_id": "kenya",
    "phone": "+254700000000",
    "address": "123 Business St",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update User Profile

```http
PUT /api/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "company_name": "Updated Company Ltd",
  "contact_person": "Jane Doe",
  "phone": "+254700000001",
  "address": "456 New Business Ave"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "user-123",
    "email": "user@example.com",
    "company_name": "Updated Company Ltd",
    "contact_person": "Jane Doe",
    "phone": "+254700000001",
    "address": "456 New Business Ave",
    "updated_at": "2024-01-02T00:00:00Z"
  }
}
```

### Applications

#### Create Application

```http
POST /api/applications
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "application_data": {
    "company_founded_year": 2020,
    "industry": "Technology",
    "employee_count": "10-50",
    "business_model": "B2B SaaS",
    "financing_amount": 500000,
    "financing_purpose": "Expansion",
    "revenue_last_year": 250000,
    "business_description": "AI-powered business solutions"
  }
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app-123",
    "user_id": "user-123",
    "status": "draft",
    "application_data": {
      "company_founded_year": 2020,
      "industry": "Technology",
      "employee_count": "10-50",
      "business_model": "B2B SaaS",
      "financing_amount": 500000,
      "financing_purpose": "Expansion",
      "revenue_last_year": 250000,
      "business_description": "AI-powered business solutions"
    },
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Applications

```http
GET /api/applications
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (`draft`, `submitted`, `under_review`, `approved`, `rejected`)
- `limit` (optional): Number of results (default: 10, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "applications": [
    {
      "id": "app-123",
      "user_id": "user-123",
      "status": "draft",
      "application_data": {
        "company_founded_year": 2020,
        "industry": "Technology",
        "financing_amount": 500000
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "has_more": false
  }
}
```

#### Get Single Application

```http
GET /api/applications/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app-123",
    "user_id": "user-123",
    "status": "draft",
    "application_data": {
      "company_founded_year": 2020,
      "industry": "Technology",
      "financing_amount": 500000
    },
    "documents": [
      {
        "id": "doc-123",
        "document_type": "Business License",
        "file_name": "license.pdf",
        "uploaded_at": "2024-01-01T00:00:00Z"
      }
    ],
    "payments": [
      {
        "id": "payment-123",
        "amount": 10000,
        "status": "completed",
        "paid_at": "2024-01-01T00:00:00Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Application

```http
PUT /api/applications/{id}
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "application_data": {
    "financing_amount": 750000,
    "business_description": "Updated description"
  }
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app-123",
    "user_id": "user-123",
    "status": "draft",
    "application_data": {
      "company_founded_year": 2020,
      "industry": "Technology",
      "financing_amount": 750000,
      "business_description": "Updated description"
    },
    "updated_at": "2024-01-02T00:00:00Z"
  }
}
```

#### Submit Application

```http
POST /api/applications/{id}/submit
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "app-123",
    "status": "submitted",
    "submitted_at": "2024-01-02T00:00:00Z"
  },
  "message": "Application submitted successfully"
}
```

### Documents

#### Get Upload URL

```http
POST /api/documents/upload
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fileName": "business_license.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "applicationId": "app-123",
  "documentType": "Business License"
}
```

**Response:**
```json
{
  "success": true,
  "uploadUrl": "https://storage.supabase.co/signed-upload-url",
  "fileName": "secure_filename.pdf",
  "documentId": "doc-123",
  "expiresAt": "2024-01-01T01:00:00Z"
}
```

#### Get Documents

```http
GET /api/applications/{id}/documents
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "documents": [
    {
      "id": "doc-123",
      "application_id": "app-123",
      "document_type": "Business License",
      "file_name": "business_license.pdf",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      "uploaded_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Document Download URL

```http
GET /api/documents/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "downloadUrl": "https://storage.supabase.co/signed-download-url",
  "expiresAt": "2024-01-01T01:00:00Z"
}
```

#### Delete Document

```http
DELETE /api/documents/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### Payments

#### Initialize Payment

```http
POST /api/payments/initialize
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "applicationId": "app-123",
  "amount": 10000,
  "currency": "USD",
  "paymentGateway": "pesapal"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-123",
    "transactionId": "txn-123",
    "amount": 10000,
    "currency": "USD",
    "status": "pending"
  },
  "redirectUrl": "https://pesapal.com/payment-page",
  "reference": "APP-123-1234567890"
}
```

#### Verify Payment

```http
POST /api/payments/verify
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "transactionId": "txn-123"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-123",
    "transactionId": "txn-123",
    "status": "completed",
    "amount": 10000,
    "currency": "USD",
    "paidAt": "2024-01-01T12:00:00Z",
    "gatewayReference": "ref-123"
  }
}
```

#### Get Payment Status

```http
GET /api/payments/{id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-123",
    "application_id": "app-123",
    "amount": 10000,
    "currency": "USD",
    "status": "completed",
    "payment_gateway": "pesapal",
    "gateway_transaction_id": "txn-123",
    "created_at": "2024-01-01T00:00:00Z",
    "paid_at": "2024-01-01T12:00:00Z"
  }
}
```

### NDA Signing

#### Get NDA Document

```http
GET /api/applications/{id}/nda
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "nda": {
    "id": "nda-123",
    "application_id": "app-123",
    "document_content": "NDA content here...",
    "version": "1.0",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Sign NDA

```http
POST /api/applications/{id}/nda/sign
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "signatureData": "data:image/png;base64,signature-data-here",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0 Browser"
}
```

**Response:**
```json
{
  "success": true,
  "signature": {
    "id": "signature-123",
    "application_id": "app-123",
    "signed_at": "2024-01-01T12:00:00Z",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0 Browser"
  },
  "message": "NDA signed successfully"
}
```

### Countries and Requirements

#### Get Countries

```http
GET /api/countries
```

**Response:**
```json
{
  "success": true,
  "countries": [
    {
      "id": "kenya",
      "name": "Kenya",
      "code": "KE",
      "flag": "🇰🇪",
      "currency": "KES",
      "document_requirements": {
        "required_documents": ["Application Form", "Business License"],
        "company_documents": ["Certificate of Incorporation"],
        "director_documents": ["National ID"]
      }
    }
  ]
}
```

#### Get Country Requirements

```http
GET /api/countries/{id}/requirements
```

**Response:**
```json
{
  "success": true,
  "country": {
    "id": "kenya",
    "name": "Kenya",
    "code": "KE"
  },
  "documentRequirements": [
    {
      "id": "req-1",
      "name": "Application Form",
      "category": "required",
      "required": true,
      "description": "Completed loan application form",
      "acceptedFormats": ["pdf"],
      "maxSizeBytes": 10485760
    }
  ],
  "totalRequired": 5,
  "categories": {
    "required": 2,
    "company": 2,
    "director": 1
  }
}
```

### Webhooks

#### Pesapal Webhook

```http
POST /api/webhooks/pesapal
```

**Request Body:**
```json
{
  "OrderTrackingId": "txn-123",
  "OrderMerchantReference": "APP-123-1234567890",
  "OrderNotificationType": "COMPLETED"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## Data Models

### User Profile

```typescript
interface UserProfile {
  id: string
  email: string
  company_name: string
  contact_person: string
  country_id: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
}
```

### Application

```typescript
interface Application {
  id: string
  user_id: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  application_data: {
    company_founded_year: number
    industry: string
    employee_count: string
    business_model: string
    financing_amount: number
    financing_purpose: string
    revenue_last_year?: number
    business_description?: string
  }
  created_at: string
  updated_at: string
  submitted_at?: string
}
```

### Document

```typescript
interface Document {
  id: string
  application_id: string
  document_type: string
  file_name: string
  file_size: number
  mime_type: string
  file_path: string
  uploaded_at: string
}
```

### Payment Record

```typescript
interface PaymentRecord {
  id: string
  application_id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  payment_gateway: string
  gateway_transaction_id?: string
  gateway_reference?: string
  created_at: string
  paid_at?: string
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { AfriRiseAPI } from '@afri-rise/api-client'

const api = new AfriRiseAPI({
  baseURL: 'https://app.afri-rise.com/api',
  apiKey: 'your-api-key'
})

// Register user
const user = await api.auth.register({
  email: 'user@example.com',
  password: 'password123',
  company_name: 'Example Company',
  contact_person: 'John Doe',
  country_id: 'kenya'
})

// Create application
const application = await api.applications.create({
  application_data: {
    company_founded_year: 2020,
    industry: 'Technology',
    financing_amount: 500000
  }
})
```

### Python

```python
from afri_rise_api import AfriRiseAPI

api = AfriRiseAPI(
    base_url='https://app.afri-rise.com/api',
    api_key='your-api-key'
)

# Register user
user = api.auth.register(
    email='user@example.com',
    password='password123',
    company_name='Example Company',
    contact_person='John Doe',
    country_id='kenya'
)

# Create application
application = api.applications.create(
    application_data={
        'company_founded_year': 2020,
        'industry': 'Technology',
        'financing_amount': 500000
    }
)
```

## Postman Collection

A Postman collection is available for testing the API:

```json
{
  "info": {
    "name": "AfriRise Capital API",
    "description": "Complete API collection for testing"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  }
}
```

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- Application management
- Document upload/download
- Payment processing
- NDA signing

### v1.1.0 (2024-02-01)
- Added country requirements endpoint
- Enhanced error responses
- Improved rate limiting
- Added webhook support

## Support

For API support, please contact:
- Email: api-support@afri-rise.com
- Documentation: https://docs.afri-rise.com
- Status Page: https://status.afri-rise.com