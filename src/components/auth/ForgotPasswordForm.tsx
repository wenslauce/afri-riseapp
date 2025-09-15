'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/lib/auth-client'

export default function ForgotPasswordForm() {
  const { resetPassword } = useSupabaseAuth()
  
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      await resetPassword(email)
      setIsSuccess(true)
    } catch (error) {
      console.error('Password reset error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto h-12 w-12 text-green-600">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          Check your email
        </h3>
        <p className="text-sm text-gray-600">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Click the link in the email to reset your password. The link will expire in 1 hour.
        </p>
        <button
          onClick={() => {
            setIsSuccess(false)
            setEmail('')
          }}
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Send another email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="form-field">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`form-input ${error ? 'border-red-500' : ''}`}
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary disabled:opacity-50"
      >
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  )
}