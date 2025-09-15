'use client'

import { ApplicationStep } from '@/types'

interface ApplicationProgressProps {
  currentStep: ApplicationStep
  applicationStatus: string
}

const steps = [
  { id: 'registration', name: 'Registration', description: 'Account created' },
  { id: 'application', name: 'Application', description: 'Form completed' },
  { id: 'documents', name: 'Documents', description: 'Files uploaded' },
  { id: 'payment', name: 'Payment', description: 'Fee paid' },
  { id: 'nda', name: 'NDA', description: 'Agreement signed' },
  { id: 'completed', name: 'Completed', description: 'Under review' }
]

export default function ApplicationProgress({ currentStep, applicationStatus }: ApplicationProgressProps) {
  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    
    if (stepIndex < currentIndex) {
      return 'completed'
    } else if (stepIndex === currentIndex) {
      return 'active'
    } else {
      return 'pending'
    }
  }

  const getStepIcon = (stepId: string, status: string) => {
    if (status === 'completed') {
      return (
        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    } else {
      const stepNumber = steps.findIndex(step => step.id === stepId) + 1
      return <span className="text-sm font-medium">{stepNumber}</span>
    }
  }

  return (
    <div className="py-4">
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => {
            const status = getStepStatus(step.id)
            
            return (
              <li key={step.id} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className={`h-0.5 w-full ${status === 'completed' ? 'bg-primary-600' : 'bg-gray-200'}`} />
                  </div>
                )}
                
                <div className="relative flex items-center justify-center">
                  <div
                    className={`
                      h-10 w-10 rounded-full flex items-center justify-center
                      ${status === 'completed' 
                        ? 'bg-primary-600 text-white' 
                        : status === 'active'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {getStepIcon(step.id, status)}
                  </div>
                </div>
                
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${status === 'active' ? 'text-primary-600' : 'text-gray-500'}`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {step.description}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
      
      {applicationStatus === 'draft' && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your application is in draft status. Complete all steps to submit for review.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
