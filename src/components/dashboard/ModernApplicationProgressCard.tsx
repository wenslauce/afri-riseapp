'use client'

import { Application } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  Clock, 
  FileText, 
  CreditCard, 
  PenTool, 
  Eye, 
  ChevronRight, 
  AlertCircle,
  PlayCircle
} from 'lucide-react'

interface ProgressStep {
  key: string
  name: string
  completed: boolean
  description: string
}

interface ApplicationProgress {
  steps: ProgressStep[]
  completedSteps: number
  totalSteps: number
  progressPercentage: number
}

interface ApplicationProgressCardProps {
  application: Application
  progress: ApplicationProgress
  onContinue: (step: string) => void
}

export default function ModernApplicationProgressCard({ 
  application, 
  progress, 
  onContinue 
}: ApplicationProgressCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { 
          variant: 'secondary' as const, 
          text: 'Draft',
          color: 'text-muted-foreground',
          icon: FileText
        }
      case 'submitted':
        return { 
          variant: 'default' as const, 
          text: 'Submitted',
          color: 'text-blue-600 dark:text-blue-400',
          icon: PlayCircle
        }
      case 'under_review':
        return { 
          variant: 'secondary' as const, 
          text: 'Under Review',
          color: 'text-amber-600 dark:text-amber-400',
          icon: Clock
        }
      case 'approved':
        return { 
          variant: 'default' as const, 
          text: 'Approved',
          color: 'text-emerald-600 dark:text-emerald-400',
          icon: CheckCircle
        }
      case 'rejected':
        return { 
          variant: 'destructive' as const, 
          text: 'Rejected',
          color: 'text-destructive',
          icon: AlertCircle
        }
      default:
        return { 
          variant: 'secondary' as const, 
          text: 'Unknown',
          color: 'text-muted-foreground',
          icon: AlertCircle
        }
    }
  }

  const getNextStep = () => {
    const incompleteStep = progress.steps.find(step => !step.completed)
    return incompleteStep?.key || null
  }

  const getStepIcon = (step: ProgressStep, index: number) => {
    const iconProps = "w-5 h-5"
    
    if (step.completed) {
      return <CheckCircle className={`${iconProps} text-emerald-600 dark:text-emerald-400`} />
    } else if (index === progress.completedSteps) {
      return <Clock className={`${iconProps} text-blue-600 dark:text-blue-400`} />
    } else {
      return <div className={`${iconProps} rounded-full border-2 border-muted flex items-center justify-center text-muted-foreground text-xs font-medium`}>
        {index + 1}
      </div>
    }
  }

  const statusConfig = getStatusConfig(application.status)
  const StatusIcon = statusConfig.icon

  // Enhanced step definitions
  const enhancedSteps = progress.steps.map((step) => {
    const stepConfigs = {
      application: { icon: FileText, description: 'Complete your loan application form' },
      documents: { icon: FileText, description: 'Upload all required documents' },
      payment: { icon: CreditCard, description: 'Pay the application processing fee' },
      nda: { icon: PenTool, description: 'Sign the non-disclosure agreement' },
      review: { icon: Clock, description: 'Our team reviews your application' }
    }
    
    const config = stepConfigs[step.key as keyof typeof stepConfigs] || { 
      icon: AlertCircle, 
      description: step.name
    }
    
    return {
      ...step,
      ...config
    }
  })

  return (
    <Card className="glass-card fade-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Application #{application.id.slice(0, 8)}</span>
            </CardTitle>
            <div className="text-muted-foreground text-sm">
              {application.application_data.financing_amount 
                ? `Financing: $${application.application_data.financing_amount.toLocaleString()}`
                : 'Financing amount not specified'
              }
            </div>
          </div>
          <Badge variant={statusConfig.variant} className="flex items-center space-x-1">
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.text}</span>
          </Badge>
        </div>

        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {progress.completedSteps}/{progress.totalSteps} steps
            </span>
          </div>
          <Progress value={progress.progressPercentage} className="h-2" />
          <div className="text-center text-sm font-medium">
            {progress.progressPercentage}% Complete
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Steps Timeline */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground mb-4 flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Application Journey</span>
          </h4>
          
          {enhancedSteps.map((step, index) => (
            <div key={step.key} className="relative">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  {getStepIcon(step, index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`rounded-lg p-4 border ${
                    step.completed ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 
                    index === progress.completedSteps ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' : 
                    'bg-muted/50 border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <step.icon className="w-4 h-4" />
                        <span className={`font-medium ${
                          step.completed ? 'text-emerald-700 dark:text-emerald-300' : 
                          index === progress.completedSteps ? 'text-blue-700 dark:text-blue-300' : 
                          'text-muted-foreground'
                        }`}>
                          {step.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {step.completed && (
                          <Badge variant="secondary" className="text-xs">
                            Complete
                          </Badge>
                        )}
                        
                        {!step.completed && index === progress.completedSteps && (
                          <Badge variant="default" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connection Line */}
              {index < enhancedSteps.length - 1 && (
                <div className="absolute left-4 top-10 w-0.5 h-6 bg-border"></div>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => onContinue('view')}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </Button>
          
          {getNextStep() && application.status !== 'approved' && application.status !== 'rejected' && (
            <Button
              onClick={() => onContinue(getNextStep()!)}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span>
                {getNextStep() === 'documents' && 'Upload Documents'}
                {getNextStep() === 'payment' && 'Make Payment'}
                {getNextStep() === 'nda' && 'Sign NDA'}
                {getNextStep() === 'review' && 'View Status'}
              </span>
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {application.status === 'approved' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Congratulations!
                </div>
                <div className="text-emerald-600 dark:text-emerald-300 text-sm">
                  Your application has been approved. we&apos;ll be in touch soon.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {application.status === 'rejected' && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <div className="font-semibold text-red-800 dark:text-red-200">
                  Application Not Approved
                </div>
                <div className="text-red-600 dark:text-red-300 text-sm">
                  Unfortunately, we couldn't approve your application at this time. Please contact us for feedback.
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
