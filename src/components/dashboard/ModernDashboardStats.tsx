'use client'

import React from 'react'
import { Application, PaymentRecord, DocumentUpload, NDASignature } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  PenTool,
  BarChart3,
  Users,
  Target,
  Calendar
} from 'lucide-react'

interface DashboardStatsProps {
  applications: Application[]
  payments: PaymentRecord[]
  documents: DocumentUpload[]
  signatures: NDASignature[]
}

interface StatItem {
  title: string
  value: number
  icon: React.ComponentType<any>
  color: string
  progress?: number
  subtitle: string
  trend?: string
}

export default function ModernDashboardStats({ 
  applications, 
  payments, 
  documents, 
  signatures 
}: DashboardStatsProps) {
  // Calculate comprehensive stats
  const totalApplications = applications.length
  const draftApplications = applications.filter(app => app.status === 'draft').length
  const submittedApplications = applications.filter(app => app.status === 'submitted').length
  const reviewApplications = applications.filter(app => app.status === 'under_review').length
  const approvedApplications = applications.filter(app => app.status === 'approved').length
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length
  const completedPayments = payments.filter(payment => payment.status === 'completed').length
  const totalDocuments = documents.length
  const signedNDAs = signatures.length

  // Calculate rates and trends
  const completionRate = totalApplications > 0 
    ? Math.round(((approvedApplications + rejectedApplications) / totalApplications) * 100)
    : 0
  
  const approvalRate = (approvedApplications + rejectedApplications) > 0
    ? Math.round((approvedApplications / (approvedApplications + rejectedApplications)) * 100)
    : 0

  const documentCompletionRate = totalApplications > 0
    ? Math.round((totalDocuments / (totalApplications * 6)) * 100) // Assuming 6 docs per application
    : 0

  const ndaCompletionRate = totalApplications > 0
    ? Math.round((signedNDAs / totalApplications) * 100)
    : 0

  // Calculate payment amounts
  const totalPaymentAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)

  const stats: StatItem[] = [
    {
      title: 'Total Applications',
      value: totalApplications,
      icon: BarChart3,
      color: 'text-blue-600 dark:text-blue-400',
      subtitle: `${draftApplications} draft applications pending`,
      trend: '+12%'
    },
    {
      title: 'Under Review',
      value: reviewApplications + submittedApplications,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      subtitle: `${reviewApplications} in review, ${submittedApplications} submitted`,
      progress: totalApplications > 0 ? Math.round(((reviewApplications + submittedApplications) / totalApplications) * 100) : 0,
      trend: '5-7 days'
    },
    {
      title: 'Approved',
      value: approvedApplications,
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      progress: approvalRate,
      subtitle: `${approvalRate}% approval rate`,
      trend: rejectedApplications > 0 ? `${rejectedApplications} rejected` : 'Perfect record'
    },
    {
      title: 'Payments',
      value: completedPayments,
      icon: DollarSign,
      color: 'text-purple-600 dark:text-purple-400',
      subtitle: `$${(totalPaymentAmount / 100).toFixed(2)} total revenue`,
      trend: `$${((totalPaymentAmount / 100) / Math.max(completedPayments, 1)).toFixed(0)} avg`
    },
    {
      title: 'Documents',
      value: totalDocuments,
      icon: FileText,
      color: 'text-indigo-600 dark:text-indigo-400',
      progress: documentCompletionRate,
      subtitle: `${Math.ceil(totalDocuments / Math.max(totalApplications, 1))} avg per application`,
      trend: `${documentCompletionRate}% complete`
    },
    {
      title: 'NDAs Signed',
      value: signedNDAs,
      icon: PenTool,
      color: 'text-pink-600 dark:text-pink-400',
      progress: ndaCompletionRate,
      subtitle: signedNDAs > 0 ? 'Legally binding agreements' : 'Awaiting signatures',
      trend: `${ndaCompletionRate}% completion`
    }
  ]

  return (
    <div className="space-y-8 mb-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="glass-card fade-in hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.value > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold">
                    {stat.value.toLocaleString()}
                  </div>
                  {stat.trend && (
                    <div className="text-sm text-muted-foreground">
                      {stat.trend}
                    </div>
                  )}
                </div>
                
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stat.subtitle}
                  </p>
                )}
                
                {stat.progress !== undefined && (
                  <div className="space-y-2">
                    <Progress value={stat.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-medium">{stat.progress}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Weekly Summary */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {applications.filter(app => {
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return new Date(app.created_at) > weekAgo
                }).length}
              </div>
              <div className="text-xs text-muted-foreground">
                New applications submitted
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Summary */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {applications.filter(app => {
                  const monthAgo = new Date()
                  monthAgo.setMonth(monthAgo.getMonth() - 1)
                  return new Date(app.created_at) > monthAgo
                }).length}
              </div>
              <div className="text-xs text-muted-foreground">
                Monthly applications
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Processing */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">5-7</div>
              <div className="text-xs text-muted-foreground">
                Days average review
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{approvalRate}%</div>
              <div className="text-xs text-muted-foreground">
                Approval rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Application Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Status Distribution</h4>
              <div className="space-y-2">
                {[
                  { status: 'draft', count: draftApplications, color: 'bg-gray-500' },
                  { status: 'submitted', count: submittedApplications, color: 'bg-blue-500' },
                  { status: 'under_review', count: reviewApplications, color: 'bg-yellow-500' },
                  { status: 'approved', count: approvedApplications, color: 'bg-green-500' },
                  { status: 'rejected', count: rejectedApplications, color: 'bg-red-500' }
                ].map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm capitalize text-muted-foreground">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            {/* Payment Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Paid</span>
                  <span className="text-sm font-medium">
                    ${(totalPaymentAmount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="text-sm font-medium">
                    {payments.filter(p => p.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Failed</span>
                  <span className="text-sm font-medium">
                    {payments.filter(p => p.status === 'failed').length}
                  </span>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="hidden md:block" />

            {/* Activity Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Activity Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="text-sm font-medium">
                    {applications.filter(app => {
                      const weekAgo = new Date()
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      return new Date(app.created_at) > weekAgo
                    }).length} applications
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="text-sm font-medium">
                    {applications.filter(app => {
                      const monthAgo = new Date()
                      monthAgo.setMonth(monthAgo.getMonth() - 1)
                      return new Date(app.created_at) > monthAgo
                    }).length} applications
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="text-sm font-medium">{completionRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
