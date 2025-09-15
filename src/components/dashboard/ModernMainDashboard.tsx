'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { UserProfile, Application, PaymentRecord, DocumentUpload, NDASignature } from '@/types'
import { useSupabaseAuth } from '@/lib/auth-client'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ModeToggle } from '@/components/mode-toggle'

// Enhanced Components
import ModernDashboardStats from './ModernDashboardStats'
import ModernApplicationProgressCard from './ModernApplicationProgressCard'

// Icons
import { 
  Plus, 
  User as UserIcon, 
  HeadphonesIcon, 
  Bell, 
  LogOut, 
  Building2,
  Target,
  Calendar,
  TrendingUp,
  BookOpen,
  Settings,
  AlertTriangle
} from 'lucide-react'

interface ModernMainDashboardProps {
  user: User
  userProfile: UserProfile | null
  applications: Application[]
  payments: PaymentRecord[]
  documents: DocumentUpload[]
  signatures: NDASignature[]
}

export default function ModernMainDashboard({ 
  user, 
  userProfile, 
  applications, 
  payments, 
  documents, 
  signatures 
}: ModernMainDashboardProps) {
  const router = useRouter()
  const { signOut } = useSupabaseAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(
    applications.length > 0 ? applications[0] : null
  )
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/')
      router.refresh() // Refresh to trigger re-authentication check
    } catch (error) {
      console.error('Sign out error:', error)
      setIsLoggingOut(false)
    }
  }

  const getApplicationProgress = (application: Application) => {
    const steps = [
      { key: 'application', name: 'Application Form', completed: true },
      { key: 'documents', name: 'Document Upload', completed: false },
      { key: 'payment', name: 'Fee Payment', completed: false },
      { key: 'nda', name: 'NDA Signing', completed: false },
      { key: 'review', name: 'Under Review', completed: false }
    ]

    // Check document upload
    const appDocuments = documents.filter(doc => doc.application_id === application.id)
    if (appDocuments.length > 0) {
      steps[1].completed = true
    }

    // Check payment
    const appPayments = payments.filter(p => p.application_id === application.id)
    const completedPayment = appPayments.find(p => p.status === 'completed')
    if (completedPayment) {
      steps[2].completed = true
    }

    // Check NDA signature
    const appSignature = signatures.find(s => s.application_id === application.id)
    if (appSignature) {
      steps[3].completed = true
    }

    // Check review status
    if (application.status === 'under_review' || application.status === 'approved' || application.status === 'rejected') {
      steps[4].completed = true
    }

    const completedSteps = steps.filter(step => step.completed).length
    const progressPercentage = (completedSteps / steps.length) * 100

    return { steps, completedSteps, totalSteps: steps.length, progressPercentage }
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const displayName = userProfile?.contact_person || user.email?.split('@')[0] || 'there'
  const userInitials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Enhanced Header */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-foreground">
                    {getGreeting()}, {displayName}
                  </h1>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{userProfile?.company_name || 'Complete your profile to get started'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
                <ModeToggle />
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!userProfile && (
            <>
              <Separator />
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Complete Your Profile Setup
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      To unlock all features and start your loan application journey, please complete your company profile.
                    </p>
                    <Button onClick={() => router.push('/profile')} size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Complete Profile Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Modern Dashboard Stats */}
        <ModernDashboardStats 
          applications={applications}
          payments={payments}
          documents={documents}
          signatures={signatures}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Progress Section */}
          <div className="lg:col-span-2 space-y-6">
            {applications.length > 0 ? (
              <>
                {/* Application Selector */}
                {applications.length > 1 && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Target className="w-5 h-5" />
                        <span>Select Application</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {applications.map((app) => (
                          <button
                            key={app.id}
                            onClick={() => setSelectedApplication(app)}
                            className={`glass-card p-4 text-left transition-all duration-200 ${
                              selectedApplication?.id === app.id
                                ? 'ring-2 ring-primary bg-accent'
                                : 'hover:bg-accent/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-foreground">
                                Application #{app.id.slice(0, 8)}
                              </div>
                              {selectedApplication?.id === app.id && (
                                <Badge variant="default">
                                  Selected
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {app.application_data.financing_amount 
                                ? `$${app.application_data.financing_amount.toLocaleString()}`
                                : 'Amount not specified'
                              }
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Selected Application Progress */}
                {selectedApplication && (
                  <ModernApplicationProgressCard
                    application={selectedApplication}
                    progress={getApplicationProgress(selectedApplication)}
                    onContinue={(step) => {
                      switch (step) {
                        case 'documents':
                          router.push(`/application/${selectedApplication.id}/documents`)
                          break
                        case 'payment':
                          router.push(`/application/${selectedApplication.id}/payment`)
                          break
                        case 'nda':
                          router.push(`/application/${selectedApplication.id}/nda`)
                          break
                        default:
                          router.push(`/application/${selectedApplication.id}`)
                      }
                    }}
                  />
                )}
              </>
            ) : (
              <Card className="glass-card text-center p-12">
                <div className="space-y-6">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      Ready to Start Your Journey?
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Begin your loan application process and unlock financing opportunities for your business growth.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => router.push('/application/new')}
                    disabled={!userProfile}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Application
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => router.push('/application/new')}
                  disabled={!userProfile}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/profile')}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  {userProfile ? 'Edit Profile' : 'Complete Profile'}
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full"
                >
                  <HeadphonesIcon className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 bg-primary rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Application #{app.id.slice(0, 8)} created
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {applications.length === 0 && (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
                        <Calendar className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                      <p className="text-xs text-muted-foreground">Your journey starts here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Help & Resources */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Help & Resources</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Application Guidelines</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Required Documents</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">FAQ</span>
                </a>
                <a href="#" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
                  <HeadphonesIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Contact Support</span>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
