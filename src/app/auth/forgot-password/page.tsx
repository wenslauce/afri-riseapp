import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>
        
        <ForgotPasswordForm />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
