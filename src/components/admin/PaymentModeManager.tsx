'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Loader2
} from 'lucide-react'

interface PaymentMode {
  mode: 'test' | 'live'
  is_active: boolean
  updated_at: string
  updated_by: string
}

export default function PaymentModeManager() {
  const [currentMode, setCurrentMode] = useState<'test' | 'live'>('test')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadCurrentMode()
  }, [])

  const loadCurrentMode = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get the current application fee to determine the mode
      const response = await fetch('/api/application-fee?mode=current')
      const result = await response.json()

      if (result.success && result.fee) {
        setCurrentMode(result.fee.payment_mode || 'test')
      }
    } catch (error) {
      console.error('Failed to load payment mode:', error)
      setError('Failed to load current payment mode')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeChange = async (newMode: 'test' | 'live') => {
    if (newMode === currentMode) return

    try {
      setIsUpdating(true)
      setError(null)
      setSuccess(null)

      // Update the application fee mode
      const response = await fetch('/api/admin/application-fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateMode: true,
          paymentMode: newMode
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update payment mode')
      }

      setCurrentMode(newMode)
      setSuccess(`Payment mode successfully switched to ${newMode.toUpperCase()} mode`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Failed to update payment mode:', error)
      setError(error instanceof Error ? error.message : 'Failed to update payment mode')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading payment mode...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Mode Display */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${
              currentMode === 'live' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Current Payment Mode
              </h3>
              <p className="text-sm text-gray-600">
                {currentMode === 'live' 
                  ? 'Live payments are active - real transactions will be processed'
                  : 'Test mode is active - no real transactions will be processed'
                }
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentMode === 'live'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {currentMode.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Mode */}
        <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
          currentMode === 'test'
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-gray-200 hover:border-yellow-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <h4 className="ml-3 text-lg font-medium text-gray-900">Test Mode</h4>
            </div>
            {currentMode === 'test' && (
              <CheckCircle className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Safe testing environment with no real transactions. Perfect for development and testing.
          </p>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              No real money transactions
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Test payment processing
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Safe for development
            </li>
          </ul>
          <button
            onClick={() => handleModeChange('test')}
            disabled={currentMode === 'test' || isUpdating}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              currentMode === 'test'
                ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Switching...
              </div>
            ) : currentMode === 'test' ? (
              'Currently Active'
            ) : (
              'Switch to Test Mode'
            )}
          </button>
        </div>

        {/* Live Mode */}
        <div className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
          currentMode === 'live'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200 hover:border-red-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h4 className="ml-3 text-lg font-medium text-gray-900">Live Mode</h4>
            </div>
            {currentMode === 'live' && (
              <CheckCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Production environment with real transactions. Use with extreme caution.
          </p>
          <ul className="text-sm text-gray-600 space-y-2 mb-4">
            <li className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              Real money transactions
            </li>
            <li className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              Production payment processing
            </li>
            <li className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              Irreversible transactions
            </li>
          </ul>
          <button
            onClick={() => handleModeChange('live')}
            disabled={currentMode === 'live' || isUpdating}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              currentMode === 'live'
                ? 'bg-red-200 text-red-800 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Switching...
              </div>
            ) : currentMode === 'live' ? (
              'Currently Active'
            ) : (
              'Switch to Live Mode'
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notice</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Test Mode:</strong> Safe for development and testing. No real transactions.</li>
          <li>• <strong>Live Mode:</strong> Production environment. Real money transactions will be processed.</li>
          <li>• Mode changes affect all new payment processing immediately.</li>
          <li>• Always test thoroughly in test mode before switching to live mode.</li>
          <li>• Only super admins can change payment modes.</li>
        </ul>
      </div>
    </div>
  )
}
