/**
 * Email Templates for AfriRise Capital Loan Application System
 */

export const emailTemplates = {
  welcome: {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AfriRise Capital</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #2563eb; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">AfriRise Capital</h1>
            <p style="color: #dbeafe; margin: 10px 0 0 0;">Empowering African Businesses</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Welcome, {{userName}}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for choosing AfriRise Capital for your financing needs. We're excited to help 
              <strong>{{companyName}}</strong> achieve its growth objectives across Africa.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0;">
              Your account has been successfully created. You can now access your personalized dashboard 
              to start your loan application process.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="{{dashboardUrl}}" 
                 style="background-color: #2563eb; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            
            <!-- Next Steps -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Next Steps:</h3>
              <ol style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Complete your company profile</li>
                <li>Fill out the loan application form</li>
                <li>Upload required documents</li>
                <li>Pay the application processing fee</li>
                <li>Sign the digital NDA</li>
              </ol>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
              If you have any questions or need assistance, please don't hesitate to contact our support team 
              at <a href="mailto:support@afri-rise.com" style="color: #2563eb;">support@afri-rise.com</a>.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>The AfriRise Capital Team</strong>
            </p>
            <p style="color: #9ca3af; margin: 20px 0 0 0; font-size: 12px;">
              AfriRise Capital Limited | Empowering African Businesses<br>
              This email was sent to {{email}}. If you didn't create an account, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Welcome to AfriRise Capital, {{userName}}!

Thank you for choosing AfriRise Capital for your financing needs. We're excited to help {{companyName}} achieve its growth objectives across Africa.

Your account has been successfully created. You can now access your personalized dashboard to start your loan application process.

Access your dashboard: {{dashboardUrl}}

Next Steps:
1. Complete your company profile
2. Fill out the loan application form
3. Upload required documents
4. Pay the application processing fee
5. Sign the digital NDA

If you have any questions or need assistance, please contact our support team at support@afri-rise.com.

Best regards,
The AfriRise Capital Team

AfriRise Capital Limited | Empowering African Businesses
This email was sent to {{email}}. If you didn't create an account, please ignore this email.
    `
  },

  application_submitted: {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Submitted Successfully</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #059669; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Application Submitted!</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0;">Your loan application is now in progress</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello {{userName}},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
              Great news! Your loan application for <strong>{{companyName}}</strong> has been successfully submitted.
            </p>
            
            <!-- Application Details -->
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0;">Application Details:</h3>
              <p style="color: #1e40af; margin: 0;"><strong>Application ID:</strong> {{applicationId}}</p>
              <p style="color: #1e40af; margin: 5px 0 0 0;"><strong>Company:</strong> {{companyName}}</p>
            </div>
            
            <!-- Next Steps -->
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #92400e; margin: 0 0 15px 0;">What's Next?</h3>
              <ol style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Upload all required documents</li>
                <li>Pay the application processing fee</li>
                <li>Sign the digital NDA</li>
                <li>Wait for our team's review (5-7 business days)</li>
              </ol>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="{{applicationUrl}}" 
                 style="background-color: #059669; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Continue Application
              </a>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
              You can track your application progress anytime by visiting your dashboard.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>The AfriRise Capital Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Application Submitted Successfully!

Hello {{userName}},

Great news! Your loan application for {{companyName}} has been successfully submitted.

Application Details:
- Application ID: {{applicationId}}
- Company: {{companyName}}

What's Next?
1. Upload all required documents
2. Pay the application processing fee
3. Sign the digital NDA
4. Wait for our team's review (5-7 business days)

Continue your application: {{applicationUrl}}

You can track your application progress anytime by visiting your dashboard.

Best regards,
The AfriRise Capital Team
    `
  },

  payment_confirmed: {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmed</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #059669; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Payment Confirmed!</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0;">Your application fee has been processed</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello {{userName}},</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
              Your payment of <strong>{{amount}}</strong> for application <strong>{{applicationId}}</strong> 
              has been successfully processed.
            </p>
            
            <!-- Payment Details -->
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #065f46; margin: 0 0 15px 0;">Payment Confirmed</h3>
              <p style="color: #065f46; margin: 0;"><strong>Amount:</strong> {{amount}}</p>
              <p style="color: #065f46; margin: 5px 0 0 0;"><strong>Application:</strong> {{applicationId}}</p>
            </div>
            
            <!-- Next Step -->
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #92400e; margin: 0 0 15px 0;">Final Step Required</h3>
              <p style="color: #92400e; margin: 0;">
                Please sign the digital Non-Disclosure Agreement to complete your application.
              </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="{{ndaUrl}}" 
                 style="background-color: #d97706; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Sign NDA Now
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>The AfriRise Capital Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Payment Confirmed!

Hello {{userName}},

Your payment of {{amount}} for application {{applicationId}} has been successfully processed.

Payment Confirmed:
- Amount: {{amount}}
- Application: {{applicationId}}

Final Step Required:
Please sign the digital Non-Disclosure Agreement to complete your application.

Sign NDA: {{ndaUrl}}

Best regards,
The AfriRise Capital Team
    `
  },

  application_complete: {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Complete - Under Review</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #7c3aed; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Application Complete!</h1>
            <p style="color: #e9d5ff; margin: 10px 0 0 0;">Now under review by our team</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Congratulations {{userName}}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
              Your loan application for <strong>{{companyName}}</strong> has been completed and is now 
              under review by our expert team.
            </p>
            
            <!-- Application Summary -->
            <div style="background-color: #f5f3ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #5b21b6; margin: 0 0 15px 0;">Application Summary</h3>
              <p style="color: #5b21b6; margin: 0;"><strong>Application ID:</strong> {{applicationId}}</p>
              <p style="color: #5b21b6; margin: 5px 0 0 0;"><strong>Company:</strong> {{companyName}}</p>
              <p style="color: #5b21b6; margin: 5px 0 0 0;"><strong>Status:</strong> Under Review</p>
            </div>
            
            <!-- Review Process -->
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1e40af; margin: 0 0 15px 0;">Review Process</h3>
              <p style="color: #1e40af; margin: 0 0 10px 0;">
                Our team will carefully review your application within <strong>{{reviewTime}}</strong>.
              </p>
              <p style="color: #1e40af; margin: 0;">
                We may contact you if we need any additional information or clarification.
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
              You'll receive email updates on your application status. You can also check your dashboard 
              anytime for real-time updates.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Best regards,<br>
              <strong>The AfriRise Capital Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Application Complete - Under Review

Congratulations {{userName}}!

Your loan application for {{companyName}} has been completed and is now under review by our expert team.

Application Summary:
- Application ID: {{applicationId}}
- Company: {{companyName}}
- Status: Under Review

Review Process:
Our team will carefully review your application within {{reviewTime}}. We may contact you if we need any additional information or clarification.

You'll receive email updates on your application status. You can also check your dashboard anytime for real-time updates.

Best regards,
The AfriRise Capital Team
    `
  },

  application_approved: {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved!</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #059669; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 APPROVED! 🎉</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0;">Your loan application has been approved</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Congratulations {{userName}}!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
              We're thrilled to inform you that your loan application for <strong>{{companyName}}</strong> 
              has been <strong style="color: #059669;">APPROVED</strong>!
            </p>
            
            <!-- Approval Details -->
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #059669;">
              <h3 style="color: #065f46; margin: 0 0 15px 0;">Approval Details</h3>
              <p style="color: #065f46; margin: 0;"><strong>Application ID:</strong> {{applicationId}}</p>
              <p style="color: #065f46; margin: 5px 0 0 0;"><strong>Approved Amount:</strong> {{loanAmount}}</p>
              <p style="color: #065f46; margin: 5px 0 0 0;"><strong>Company:</strong> {{companyName}}</p>
            </div>
            
            <!-- Next Steps -->
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #92400e; margin: 0 0 15px 0;">Next Steps</h3>
              <ol style="color: #92400e; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Our team will contact you within 2 business days</li>
                <li>We'll schedule a call to discuss loan terms and conditions</li>
                <li>Legal documentation will be prepared</li>
                <li>Funds will be disbursed upon agreement signing</li>
              </ol>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin: 30px 0 0 0;">
              Our team will reach out to you soon at <strong>{{contactInfo}}</strong> to discuss the next steps.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Congratulations once again!<br>
              <strong>The AfriRise Capital Team</strong>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
🎉 APPLICATION APPROVED! 🎉

Congratulations {{userName}}!

We're thrilled to inform you that your loan application for {{companyName}} has been APPROVED!

Approval Details:
- Application ID: {{applicationId}}
- Approved Amount: {{loanAmount}}
- Company: {{companyName}}

Next Steps:
1. Our team will contact you within 2 business days
2. We'll schedule a call to discuss loan terms and conditions
3. Legal documentation will be prepared
4. Funds will be disbursed upon agreement signing

Our team will reach out to you soon at {{contactInfo}} to discuss the next steps.

Congratulations once again!
The AfriRise Capital Team
    `
  }
}

export default emailTemplates