# Testing Guide

## Overview

This document provides comprehensive guidance on testing the AfriRise Capital Loan Application System. Our testing strategy covers unit tests, integration tests, performance tests, and end-to-end testing scenarios.

## Testing Stack

- **Testing Framework**: Jest
- **React Testing**: React Testing Library
- **Mocking**: Jest mocks and manual mocks
- **Performance Testing**: Node.js Performance API
- **Coverage**: Jest coverage reports

## Test Structure

```
src/__tests__/
├── integration/           # Integration tests
│   └── ApplicationFlow.test.ts
├── api/                  # API endpoint tests
│   └── endpoints.test.ts
├── performance/          # Performance and load tests
│   └── LoadTests.test.ts
├── email/               # Email service tests
│   └── EmailService.test.ts
├── security/            # Security tests
│   ├── EncryptionService.test.ts
│   └── FileAccessControl.test.ts
├── auth/                # Authentication tests
│   ├── LoginForm.test.tsx
│   └── RegistrationForm.test.tsx
├── application/         # Application form tests
│   ├── ModernApplicationForm.test.tsx
│   └── ModernEditApplicationForm.test.tsx
├── documents/           # Document management tests
│   ├── ModernDocumentUploadZone.test.tsx
│   ├── ModernDocumentUploadManager.test.tsx
│   ├── DocumentList.test.tsx
│   └── CountryDocumentChecklist.test.tsx
├── nda/                 # NDA signing tests
│   ├── NDASigningManager.test.tsx
│   ├── SignatureCapture.test.tsx
│   ├── NDADocument.test.tsx
│   └── SignatureVerification.test.tsx
├── dashboard/           # Dashboard tests
│   ├── ModernMainDashboard.test.tsx
│   ├── ModernDashboardStats.test.tsx
│   └── ModernApplicationProgressCard.test.tsx
└── countries/           # Country service tests
    └── CountryService.test.ts
```

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Individual Test Files
```bash
# Run specific test file
npm test -- ModernApplicationForm.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should handle user registration"

# Run tests in specific directory
npm test -- src/__tests__/auth/
```

## Test Categories

### 1. Unit Tests

Unit tests focus on individual components and functions in isolation.

**Coverage Areas:**
- React components
- Utility functions
- Service classes
- Data validation
- Business logic

**Example:**
```typescript
describe('ModernApplicationForm', () => {
  it('should validate required fields', () => {
    const { getByRole, getByText } = render(<ModernApplicationForm user={mockUser} userProfile={mockProfile} />)
    
    fireEvent.click(getByRole('button', { name: /submit/i }))
    
    expect(getByText(/company name is required/i)).toBeInTheDocument()
  })
})
```

### 2. Integration Tests

Integration tests verify that different parts of the system work together correctly.

**Coverage Areas:**
- Complete user workflows
- API endpoint interactions
- Database operations
- External service integrations
- Cross-component communication

**Example:**
```typescript
describe('Complete Application Flow', () => {
  it('should complete full application journey', async () => {
    // Test user registration → application creation → document upload → payment → NDA signing
  })
})
```

### 3. Performance Tests

Performance tests ensure the system meets performance requirements under various load conditions.

**Coverage Areas:**
- Database query performance
- File upload performance
- API response times
- Memory usage
- Concurrent user handling
- Rate limiting efficiency

**Example:**
```typescript
describe('Database Performance', () => {
  it('should handle concurrent queries within acceptable time', async () => {
    const startTime = performance.now()
    // Execute concurrent operations
    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(1000)
  })
})
```

### 4. Security Tests

Security tests verify that the system properly handles security concerns.

**Coverage Areas:**
- Data encryption/decryption
- File access controls
- Input sanitization
- Authentication flows
- Authorization checks

### 5. API Tests

API tests verify that all endpoints work correctly and handle errors appropriately.

**Coverage Areas:**
- Request/response validation
- Error handling
- Authentication requirements
- Rate limiting
- Security headers

## Testing Best Practices

### 1. Test Organization

- **Arrange, Act, Assert**: Structure tests clearly
- **Descriptive Names**: Use clear, descriptive test names
- **Single Responsibility**: Each test should verify one specific behavior
- **Independent Tests**: Tests should not depend on each other

### 2. Mocking Strategy

```typescript
// Mock external dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
```

### 3. Test Data Management

```typescript
// Use factories for test data
const createTestUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  company_name: 'Test Company',
  ...overrides
})
```

### 4. Async Testing

```typescript
// Properly handle async operations
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})

// Use waitFor for React components
await waitFor(() => {
  expect(getByText('Success')).toBeInTheDocument()
})
```

## Coverage Requirements

### Minimum Coverage Targets

- **Overall Coverage**: 80%
- **Critical Paths**: 95%
- **Security Functions**: 100%
- **Payment Processing**: 100%
- **Data Validation**: 90%

### Coverage Reports

Generate coverage reports:
```bash
npm run test:coverage
```

View coverage report:
```bash
open coverage/lcov-report/index.html
```

## Continuous Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled daily runs

### Test Pipeline

1. **Lint and Format Check**
2. **Unit Tests**
3. **Integration Tests**
4. **Performance Tests**
5. **Coverage Report**
6. **Security Scan**

## Debugging Tests

### Common Issues

1. **Async/Await Problems**
   ```typescript
   // Wrong
   it('should work', () => {
     asyncFunction().then(result => {
       expect(result).toBe(true)
     })
   })
   
   // Correct
   it('should work', async () => {
     const result = await asyncFunction()
     expect(result).toBe(true)
   })
   ```

2. **React Testing Library Queries**
   ```typescript
   // Use getBy* for elements that should exist
   expect(getByText('Submit')).toBeInTheDocument()
   
   // Use queryBy* for elements that might not exist
   expect(queryByText('Error')).not.toBeInTheDocument()
   
   // Use findBy* for async elements
   const element = await findByText('Loaded')
   ```

3. **Mock Cleanup**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks()
   })
   
   afterEach(() => {
     jest.restoreAllMocks()
   })
   ```

### Debug Mode

Run tests in debug mode:
```bash
# Node.js debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# VS Code debugging
# Add breakpoints and use "Debug Jest Tests" configuration
```

## Performance Testing Guidelines

### Load Testing Scenarios

1. **Normal Load**: Expected daily usage
2. **Peak Load**: Maximum expected concurrent users
3. **Stress Load**: Beyond normal capacity
4. **Spike Load**: Sudden traffic increases

### Performance Metrics

- **Response Time**: < 200ms for API calls
- **Throughput**: Handle 1000+ concurrent users
- **Memory Usage**: < 512MB per process
- **CPU Usage**: < 80% under normal load

### Performance Test Examples

```typescript
describe('Performance Tests', () => {
  it('should handle concurrent user registrations', async () => {
    const concurrentUsers = 100
    const promises = Array.from({ length: concurrentUsers }, () => 
      registerUser()
    )
    
    const startTime = performance.now()
    await Promise.all(promises)
    const endTime = performance.now()
    
    expect(endTime - startTime).toBeLessThan(5000)
  })
})
```

## Security Testing

### Security Test Areas

1. **Input Validation**
2. **SQL Injection Prevention**
3. **XSS Protection**
4. **CSRF Protection**
5. **Authentication Bypass**
6. **Authorization Checks**
7. **Data Encryption**
8. **File Upload Security**

### Security Test Examples

```typescript
describe('Security Tests', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --"
    const result = await searchUsers(maliciousInput)
    
    // Should not execute SQL injection
    expect(result.error).toContain('Invalid input')
  })
})
```

## Test Environment Setup

### Environment Variables

```bash
# Test environment variables
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
SUPABASE_SERVICE_ROLE_KEY=test-key
ENCRYPTION_KEY=test-encryption-key
```

### Database Setup

```typescript
// Setup test database
beforeAll(async () => {
  await setupTestDatabase()
})

afterAll(async () => {
  await cleanupTestDatabase()
})
```

## Troubleshooting

### Common Test Failures

1. **Timeout Errors**: Increase timeout for slow operations
2. **Mock Issues**: Ensure mocks are properly configured
3. **Async Issues**: Use proper async/await patterns
4. **Environment Issues**: Check environment variables

### Getting Help

- Check Jest documentation
- Review React Testing Library guides
- Consult team testing standards
- Use debugging tools and techniques

## Conclusion

Comprehensive testing ensures the reliability, performance, and security of the AfriRise Capital Loan Application System. Follow these guidelines to maintain high code quality and system reliability.

For questions or improvements to this testing guide, please contact the development team.