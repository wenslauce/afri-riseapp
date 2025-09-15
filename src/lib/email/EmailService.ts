import { createClient } from '@/utils/supabase/server'
import { Application, UserProfile, PaymentRecord, NDASignature } from '@/types'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

export interface EmailNotification {
  to: string
  subject: string
  htmlContent: string
  textContent: string
  templateId?: string
  variables?: Record<string, any>
  priority: 'low' | 'normal' | 'high'
  category: 'auth' | 'application' | 'payment' | 'document' | 'nda' | 'system'
}

export interface EmailLog {
  id: string
  userId?: string
  email: string
  subject: string
  templateId?: string
  status: 'pending' | 'sent' | 'failed' | 'bounced'
  sentAt?: string
  failureReason?: string
  category: string
  priority: string
}

export class EmailService {
  private static instance: EmailService
  private templates: Map<string, EmailTemplate> = new Map()

  private constructor() {
    this.initializeTemplates()
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Initialize email templates
   */
  private initializeTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        id: 'welcome',
        name: 'Welcome Email',
        subject: 'Welcome to AfriRise Capital - Your Loan Application Journey Begins',
        htmlContent: this.getWelcomeTemplate(),
        textContent: this.getWelcomeTextTemplate(),
        variables: ['userName', 'companyName', 'dashboardUrl']
      },
      {
        id: 'application_submitted',
        name: 'Application Submitted',
        subject: 'Application Submitted Successfully - Next Steps',
        htmlContent: this.getApplicationSubmittedTemplate(),
        textContent: this.getApplicationSubmittedTextTemplate(),
        variables: ['userName', 'applicationId', 'companyName', 'applicationUrl']
      },
      {
        id: 'documents_required',
        name: 'Documents Required',
        subject: 'Action Required: Upload Required Documents',
        htmlContent: this.getDocumentsRequiredTemplate(),
        textContent: this.getDocumentsRequiredTextTemplate(),
        variables: ['userName', 'applicationId', 'documentsUrl', 'requiredDocuments']
      },
      {
        id: 'payment_required',
        name: 'Payment Required',
        subject: 'Complete Your Application - Payment Required',
        htmlContent: this.getPaymentRequiredTemplate(),
        textContent: this.getPaymentRequiredTextTemplate(),
        variables: ['userName', 'applicationId', 'amount', 'paymentUrl']
      },
      {
        id: 'payment_confirmed',
        name: 'Payment Confirmed',
        subject: 'Payment Confirmed - Proceed to NDA Signing',
        htmlContent: this.getPaymentConfirmedTemplate(),
        textContent: this.getPaymentConfirmedTextTemplate(),
        variables: ['userName', 'applicationId', 'amount', 'ndaUrl']
      },
      {
        id: 'nda_required',
        name: 'NDA Signing Required',
        subject: 'Final Step: Sign Your NDA',
        htmlContent: this.getNDARequiredTemplate(),
        textContent: this.getNDARequiredTextTemplate(),
        variables: ['userName', 'applicationId', 'ndaUrl']
      },
      {
        id: 'application_complete',
        name: 'Application Complete',
        subject: 'Application Complete - Under Review',
        htmlContent: this.getApplicationCompleteTemplate(),
        textContent: this.getApplicationCompleteTextTemplate(),
        variables: ['userName', 'applicationId', 'companyName', 'reviewTime']
      },
      {
        id: 'application_approved',
        name: 'Application Approved',
        subject: 'Congratulations! Your Loan Application Has Been Approved',
        htmlContent: this.getApplicationApprovedTemplate(),
        textContent: this.getApplicationApprovedTextTemplate(),
        variables: ['userName', 'applicationId', 'companyName', 'loanAmount', 'contactInfo']
      },
      {
        id: 'application_rejected',
        name: 'Application Rejected',
        subject: 'Update on Your Loan Application',
        htmlContent: this.getApplicationRejectedTemplate(),
        textContent: this.getApplicationRejectedTextTemplate(),
        variables: ['userName', 'applicationId', 'companyName', 'reason', 'supportUrl']
      }
    ]

    templates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  /**
   * Send email notification
   */
  async sendEmail(notification: EmailNotification): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Log email attempt
      await this.logEmail({
        userId: undefined,
        email: notification.to,
        subject: notification.subject,
        templateId: notification.templateId,
        status: 'pending',
        category: notification.category,
        priority: notification.priority
      })

      // In a real implementation, you would integrate with an email service like:
      // - SendGrid
      // - Mailgun
      // - AWS SES
      // - Postmark
      // - Resend
      
      // For now, we'll simulate sending
      const success = await this.simulateEmailSending(notification)
      
      if (success) {
        await this.updateEmailLog(notification.to, notification.subject, 'sent')
        return { success: true, messageId: `msg_${Date.now()}` }
      } else {
        await this.updateEmailLog(notification.to, notification.subject, 'failed', 'Simulated failure')
        return { success: false, error: 'Email sending failed' }
      }
    } catch (error) {
      console.error('Email sending error:', error)
      await this.updateEmailLog(notification.to, notification.subject, 'failed', error instanceof Error ? error.message : 'Unknown error')
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(
    templateId: string,
    to: string,
    variables: Record<string, any>,
    options: {
      priority?: 'low' | 'normal' | 'high'
      category?: string
      userId?: string
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const template = this.templates.get(templateId)
    if (!template) {
      return { success: false, error: `Template ${templateId} not found` }
    }

    const htmlContent = this.replaceVariables(template.htmlContent, variables)
    const textContent = this.replaceVariables(template.textContent, variables)
    const subject = this.replaceVariables(template.subject, variables)

    return this.sendEmail({
      to,
      subject,
      htmlContent,
      textContent,
      templateId,
      variables,
      priority: options.priority || 'normal',
      category: (options.category as 'auth' | 'application' | 'payment' | 'document' | 'nda' | 'system') || 'system'
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(userProfile: UserProfile): Promise<void> {
    await this.sendTemplatedEmail('welcome', userProfile.email, {
      userName: userProfile.contact_person,
      companyName: userProfile.company_name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    }, {
      category: 'auth',
      priority: 'normal',
      userId: userProfile.id
    })
  }

  /**
   * Send application submitted notification
   */
  async sendApplicationSubmittedEmail(application: Application, userProfile: UserProfile): Promise<void> {
    await this.sendTemplatedEmail('application_submitted', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      companyName: userProfile.company_name,
      applicationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/application/${application.id}`
    }, {
      category: 'application',
      priority: 'normal',
      userId: userProfile.id
    })
  }

  /**
   * Send documents required notification
   */
  async sendDocumentsRequiredEmail(application: Application, userProfile: UserProfile, requiredDocuments: string[]): Promise<void> {
    await this.sendTemplatedEmail('documents_required', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      documentsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/application/${application.id}/documents`,
      requiredDocuments: requiredDocuments.join(', ')
    }, {
      category: 'document',
      priority: 'high',
      userId: userProfile.id
    })
  }

  /**
   * Send payment required notification
   */
  async sendPaymentRequiredEmail(application: Application, userProfile: UserProfile, amount: number): Promise<void> {
    await this.sendTemplatedEmail('payment_required', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      amount: `$${(amount / 100).toFixed(2)}`,
      paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/application/${application.id}/payment`
    }, {
      category: 'payment',
      priority: 'high',
      userId: userProfile.id
    })
  }

  /**
   * Send payment confirmed notification
   */
  async sendPaymentConfirmedEmail(application: Application, userProfile: UserProfile, payment: PaymentRecord): Promise<void> {
    await this.sendTemplatedEmail('payment_confirmed', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      amount: `$${(payment.amount / 100).toFixed(2)}`,
      ndaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/application/${application.id}/nda`
    }, {
      category: 'payment',
      priority: 'normal',
      userId: userProfile.id
    })
  }

  /**
   * Send NDA signing required notification
   */
  async sendNDARequiredEmail(application: Application, userProfile: UserProfile): Promise<void> {
    await this.sendTemplatedEmail('nda_required', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      ndaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/application/${application.id}/nda`
    }, {
      category: 'nda',
      priority: 'high',
      userId: userProfile.id
    })
  }

  /**
   * Send application complete notification
   */
  async sendApplicationCompleteEmail(application: Application, userProfile: UserProfile): Promise<void> {
    await this.sendTemplatedEmail('application_complete', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      companyName: userProfile.company_name,
      reviewTime: '5-7 business days'
    }, {
      category: 'application',
      priority: 'normal',
      userId: userProfile.id
    })
  }

  /**
   * Send application approved notification
   */
  async sendApplicationApprovedEmail(application: Application, userProfile: UserProfile): Promise<void> {
    await this.sendTemplatedEmail('application_approved', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      companyName: userProfile.company_name,
      loanAmount: application.application_data.financing_amount 
        ? `$${application.application_data.financing_amount.toLocaleString()}`
        : 'TBD',
      contactInfo: 'loans@afri-rise.com'
    }, {
      category: 'application',
      priority: 'high',
      userId: userProfile.id
    })
  }

  /**
   * Send application rejected notification
   */
  async sendApplicationRejectedEmail(application: Application, userProfile: UserProfile, reason?: string): Promise<void> {
    await this.sendTemplatedEmail('application_rejected', userProfile.email, {
      userName: userProfile.contact_person,
      applicationId: application.id.slice(0, 8),
      companyName: userProfile.company_name,
      reason: reason || 'Please contact our team for more details',
      supportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`
    }, {
      category: 'application',
      priority: 'high',
      userId: userProfile.id
    })
  }

  /**
   * Replace variables in template content
   */
  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(regex, String(value))
    }
    return result
  }

  /**
   * Simulate email sending (replace with real email service)
   */
  private async simulateEmailSending(notification: EmailNotification): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Simulate 95% success rate
    return Math.random() > 0.05
  }

  /**
   * Log email to database
   */
  private async logEmail(emailLog: Omit<EmailLog, 'id'>): Promise<void> {
    try {
      const supabase = await createClient()
      
      await supabase
        .from('email_logs')
        .insert({
          user_id: emailLog.userId,
          email: emailLog.email,
          subject: emailLog.subject,
          template_id: emailLog.templateId,
          status: emailLog.status,
          category: emailLog.category,
          priority: emailLog.priority,
          failure_reason: emailLog.failureReason
        })
    } catch (error) {
      console.error('Failed to log email:', error)
    }
  }

  /**
   * Update email log status
   */
  private async updateEmailLog(email: string, subject: string, status: EmailLog['status'], failureReason?: string): Promise<void> {
    try {
      const supabase = await createClient()
      
      await supabase
        .from('email_logs')
        .update({
          status,
          sent_at: status === 'sent' ? new Date().toISOString() : undefined,
          failure_reason: failureReason
        })
        .eq('email', email)
        .eq('subject', subject)
        .eq('status', 'pending')
    } catch (error) {
      console.error('Failed to update email log:', error)
    }
  }

  /**
   * Get email templates (for admin interface)
   */
  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId)
  }

  // Template content methods (truncated for brevity - would contain full HTML/text templates)
  private getWelcomeTemplate(): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to AfriRise Capital, {{userName}}!</h1>
        <p>Thank you for choosing AfriRise Capital for your financing needs. We're excited to help {{companyName}} achieve its growth objectives.</p>
        <p>Your account has been successfully created. You can now access your dashboard to start your loan application process.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Dashboard</a>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The AfriRise Capital Team</p>
      </div>
    `
  }

  private getWelcomeTextTemplate(): string {
    return `
Welcome to AfriRise Capital, {{userName}}!

Thank you for choosing AfriRise Capital for your financing needs. We're excited to help {{companyName}} achieve its growth objectives.

Your account has been successfully created. You can now access your dashboard to start your loan application process.

Access your dashboard: {{dashboardUrl}}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The AfriRise Capital Team
    `
  }

  // Additional template methods would be implemented here...
  private getApplicationSubmittedTemplate(): string { return '' }
  private getApplicationSubmittedTextTemplate(): string { return '' }
  private getDocumentsRequiredTemplate(): string { return '' }
  private getDocumentsRequiredTextTemplate(): string { return '' }
  private getPaymentRequiredTemplate(): string { return '' }
  private getPaymentRequiredTextTemplate(): string { return '' }
  private getPaymentConfirmedTemplate(): string { return '' }
  private getPaymentConfirmedTextTemplate(): string { return '' }
  private getNDARequiredTemplate(): string { return '' }
  private getNDARequiredTextTemplate(): string { return '' }
  private getApplicationCompleteTemplate(): string { return '' }
  private getApplicationCompleteTextTemplate(): string { return '' }
  private getApplicationApprovedTemplate(): string { return '' }
  private getApplicationApprovedTextTemplate(): string { return '' }
  private getApplicationRejectedTemplate(): string { return '' }
  private getApplicationRejectedTextTemplate(): string { return '' }
}

// Export singleton instance
export const emailService = EmailService.getInstance()