'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  User,
  Calendar,
  DollarSign,
  Globe,
  Building,
  ChevronLeft,
  ChevronRight,
  Edit,
  MessageSquare,
  MoreVertical
} from 'lucide-react'
import { AdminUser } from '@/lib/admin/AdminAuth'
import { ApplicationWithDetails, ApplicationFilters } from '@/lib/admin/ApplicationManagement'
import { applicationManagementClient } from '@/lib/admin/ApplicationManagementClient'
import { Application } from '@/types'

interface ApplicationManagementProps {
  admin: AdminUser
}

interface ApplicationListState {
  applications: ApplicationWithDetails[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  filters: ApplicationFilters
}

export default function ApplicationManagement({ admin }: ApplicationManagementProps) {
  const [state, setState] = useState<ApplicationListState>({
    applications: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    loading: true,
    filters: {}
  })

  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadApplications()
  }, [state.page, state.filters])

  const loadApplications = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      const applications = await applicationManagementClient.getAllApplications(
        { ...state.filters, search: searchTerm }
      )

      setState(prev => ({
        ...prev,
        applications: applications,
        total: applications.length,
        totalPages: Math.ceil(applications.length / state.limit),
        loading: false
      }))
    } catch (error) {
      console.error('Failed to load applications:', error)
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleStatusUpdate = async (applicationId: string, status: Application['status'], reason?: string) => {
    try {
      const result = await applicationManagementClient.updateApplicationStatus(
        applicationId,
        status,
        reason
      )

      if (result.success) {
        await loadApplications()
        setSelectedApplication(null)
      } else {
        alert(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Status update error:', error)
      alert('Failed to update application status')
    }
  }

  const handleSearch = () => {
    setState(prev => ({ ...prev, page: 1 }))
    loadApplications()
  }

  const handleFilterChange = (newFilters: Partial<ApplicationFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      page: 1
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'under_review': return <Clock className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (state.loading && state.applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded mb-4"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and review loan applications
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </button>
                
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      onChange={(e) => handleFilterChange({ 
                        status: e.target.value ? [e.target.value as Application['status']] : undefined 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                    <input
                      type="date"
                      onChange={(e) => handleFilterChange({ date_from: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                    <input
                      type="date"
                      onChange={(e) => handleFilterChange({ date_to: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      onChange={(e) => handleFilterChange({ 
                        amount_min: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.user_profile?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.user_profile?.company_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.user_profile?.contact_person}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(application.application_data?.financing_amount || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.application_data?.industry}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.created_at)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {application.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {state.totalPages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((state.page - 1) * state.limit) + 1} to {Math.min(state.page * state.limit, state.total)} of {state.total} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={state.page === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <span className="px-3 py-1 text-sm">
                  Page {state.page} of {state.totalPages}
                </span>
                
                <button
                  onClick={() => setState(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={state.page === state.totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            admin={admin}
            onClose={() => setSelectedApplication(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  )
}

// Application Detail Modal Component
interface ApplicationDetailModalProps {
  application: ApplicationWithDetails
  admin: AdminUser
  onClose: () => void
  onStatusUpdate: (applicationId: string, status: Application['status'], reason?: string) => void
}

function ApplicationDetailModal({ application, admin, onClose, onStatusUpdate }: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [newNote, setNewNote] = useState('')
  const [statusReason, setStatusReason] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      await applicationManagementClient.addReviewNote(application.id, newNote)
      setNewNote('')
      // Refresh application data
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Application Details
            </h2>
            <p className="text-sm text-gray-500">
              {application.user_profile?.company_name} - {application.id.slice(0, 8)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {['details', 'documents', 'payments', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                      <dd className="text-sm text-gray-900">{application.user_profile?.company_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                      <dd className="text-sm text-gray-900">{application.user_profile?.contact_person}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900">{application.user_profile?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Country</dt>
                      <dd className="text-sm text-gray-900 capitalize">{application.user_profile?.country_id}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Financing Amount</dt>
                      <dd className="text-sm text-gray-900">
                        {formatCurrency(application.application_data?.financing_amount || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Industry</dt>
                      <dd className="text-sm text-gray-900">{application.application_data?.industry}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Business Model</dt>
                      <dd className="text-sm text-gray-900">{application.application_data?.business_model}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Founded Year</dt>
                      <dd className="text-sm text-gray-900">{application.application_data?.company_founded_year}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {application.application_data?.business_description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Business Description</h3>
                  <p className="text-sm text-gray-700">{application.application_data.business_description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Documents</h3>
              <div className="space-y-3">
                {application.documents?.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.document_type}</div>
                        <div className="text-sm text-gray-500">{doc.file_name}</div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {application.payments?.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount / 100)}
                        </div>
                        <div className="text-sm text-gray-500">{payment.status}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Notes</h3>
              
              {/* Add Note */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a review note..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {application.review_notes?.map((note) => (
                  <div key={note.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{note.admin_email}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          note.note_type === 'approval' ? 'bg-green-100 text-green-800' :
                          note.note_type === 'rejection' ? 'bg-red-100 text-red-800' :
                          note.note_type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {note.note_type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {application.status === 'submitted' && (
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Reason for status change (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => onStatusUpdate(application.id, 'approved', statusReason)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => onStatusUpdate(application.id, 'rejected', statusReason)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
