'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  Globe,
  Building
} from 'lucide-react'
import { AdminUser } from '@/lib/admin/AdminAuth'
import { ApplicationStats } from '@/lib/admin/ApplicationManagement'

interface AdminDashboardProps {
  admin: AdminUser
}

interface DashboardStats {
  applications: ApplicationStats
  recentActivity: any[]
  loading: boolean
}

export default function AdminDashboard({ admin }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    applications: {
      total: 0,
      by_status: {
        draft: 0,
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0
      },
      by_country: {},
      by_industry: {},
      average_amount: 0,
      total_amount: 0,
      approval_rate: 0,
      processing_time_avg: 0
    },
    recentActivity: [],
    loading: true
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }))

      // Fetch real data from API
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const result = await response.json()
      console.log('Dashboard received API response:', result)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard stats')
      }
      
      const dashboardData = {
        applications: {
          total: result.total,
          by_status: result.by_status,
          by_country: result.by_country,
          by_industry: result.by_industry,
          average_amount: result.average_amount,
          total_amount: result.total_amount,
          approval_rate: result.approval_rate,
          processing_time_avg: result.processing_time_avg
        },
        recentActivity: result.recent_activity || [],
        loading: false
      }
      
      console.log('Setting dashboard data:', dashboardData)
      setStats(dashboardData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  if (stats.loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow h-32"></div>
              ))}
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {admin.email} ({admin.role})
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applications.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.applications.approval_rate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Funding</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.applications.total_amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.applications.processing_time_avg.toFixed(1)} days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Status Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status Overview</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="p-3 bg-gray-100 rounded-lg mb-2">
                    <FileText className="h-6 w-6 text-gray-600 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-xl font-bold text-gray-900">{stats.applications.by_status.draft}</p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-blue-100 rounded-lg mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-600 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="text-xl font-bold text-gray-900">{stats.applications.by_status.submitted}</p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-yellow-100 rounded-lg mb-2">
                    <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-xl font-bold text-gray-900">{stats.applications.by_status.under_review}</p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-green-100 rounded-lg mb-2">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-xl font-bold text-gray-900">{stats.applications.by_status.approved}</p>
                </div>

                <div className="text-center">
                  <div className="p-3 bg-red-100 rounded-lg mb-2">
                    <XCircle className="h-6 w-6 text-red-600 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-xl font-bold text-gray-900">{stats.applications.by_status.rejected}</p>
                </div>
              </div>
            </div>

            {/* Country Distribution */}
            <div className="bg-white p-6 rounded-lg shadow mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications by Country</h2>
              <div className="space-y-3">
                {Object.entries(stats.applications.by_country)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {country}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(count / stats.applications.total) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Industry Distribution */}
            <div className="bg-white p-6 rounded-lg shadow mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Applications by Industry</h2>
              <div className="space-y-3">
                {Object.entries(stats.applications.by_industry)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([industry, count]) => (
                    <div key={industry} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {industry}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(count / stats.applications.total) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'application_update' 
                        ? 'bg-blue-100' 
                        : 'bg-yellow-100'
                    }`}>
                      {activity.type === 'application_update' ? (
                        <FileText className={`h-4 w-4 ${
                          activity.type === 'application_update' 
                            ? 'text-blue-600' 
                            : 'text-yellow-600'
                        }`} />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View All Activity
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Manage Applications
                    </span>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      View Reports
                    </span>
                  </div>
                </button>
                
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-sm font-medium text-gray-900">
                      Export Data
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}