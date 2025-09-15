'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Application, UserProfile, ApplicationStep } from '@/types'
import ApplicationProgress from './ApplicationProgress'

interface ApplicationViewProps {
  application: Application
  userProfile: UserProfile | null
}

export default function ApplicationView({ application, userProfile }: ApplicationViewProps) {
  const router = useRouter()
  
  const getApplicationStep = (): ApplicationStep => {
    // Determine current step based on application status and data
    if (application.status === 'draft') {
      return 'application'
    }
    // Add logic for other steps based on document uploads, payments, etc.
    return 'application'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Application #{application.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                {userProfile?.company_name} - Loan Application
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
                {formatStatus(application.status)}
              </span>
              {application.status === 'draft' && (
                <button
                  onClick={() => router.push(`/application/${application.id}/edit`)}
                  className="btn-primary"
                >
                  Continue Application
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4">
          <ApplicationProgress 
            currentStep={getApplicationStep()}
            applicationStatus={application.status}
          />
        </div>
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Founded Year</dt>
                  <dd className="text-sm text-gray-900">{application.application_data.company_founded_year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Industry</dt>
                  <dd className="text-sm text-gray-900">{application.application_data.industry || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Employee Count</dt>
                  <dd className="text-sm text-gray-900">{application.application_data.employee_count || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Foreign Markets</dt>
                  <dd className="text-sm text-gray-900">
                    {application.application_data.foreign_markets ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Office Locations</dt>
                  <dd className="text-sm text-gray-900">{application.application_data.company_offices || 'Not specified'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Business Model</dt>
                <dd className="text-sm text-gray-900">{application.application_data.business_model || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Competitive Advantage</dt>
                <dd className="text-sm text-gray-900">{application.application_data.competitive_advantage || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Main Competitors</dt>
                <dd className="text-sm text-gray-900">{application.application_data.competitors || 'Not specified'}</dd>
              </div>
            </div>
          </div>

          {/* Financing Details */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Financing Details</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Purpose of Financing</dt>
                <dd className="text-sm text-gray-900">{application.application_data.financing_purpose || 'Not specified'}</dd>
              </div>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Amount Requested</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {application.application_data.financing_amount ? 
                      formatCurrency(application.application_data.financing_amount) : 
                      'Not specified'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Interest Rate</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {application.application_data.requested_interest_rate ? 
                      `${application.application_data.requested_interest_rate}%` : 
                      'Not specified'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Loan Term</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {application.application_data.loan_term ? 
                      `${application.application_data.loan_term} months` : 
                      'Not specified'
                    }
                  </dd>
                </div>
              </dl>
              <div>
                <dt className="text-sm font-medium text-gray-500">Project Shovel Ready</dt>
                <dd className="text-sm text-gray-900">
                  {application.application_data.project_shovel_ready ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Previous Financing</dt>
                <dd className="text-sm text-gray-900">
                  {application.application_data.previous_financing ? 'Yes' : 'No'}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="px-6 py-4 space-y-3">
              {application.status === 'draft' && (
                <>
                  <button
                    onClick={() => router.push(`/application/${application.id}/edit`)}
                    className="w-full btn-primary"
                  >
                    Continue Application
                  </button>
                  <button
                    onClick={() => router.push(`/application/${application.id}/documents`)}
                    className="w-full btn-secondary"
                  >
                    Upload Documents
                  </button>
                </>
              )}
              
              <button
                onClick={() => router.push('/')}
                className="w-full btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Application Timeline */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              Application created on{' '}
                              <time dateTime={application.created_at}>
                                {new Date(application.created_at).toLocaleDateString()}
                              </time>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  
                  {application.updated_at !== application.created_at && (
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                Last updated on{' '}
                                <time dateTime={application.updated_at}>
                                  {new Date(application.updated_at).toLocaleDateString()}
                                </time>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}