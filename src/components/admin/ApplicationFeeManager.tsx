'use client'

import { useState, useEffect } from 'react'
import { applicationFeeClient, ApplicationFee } from '@/lib/application-fees/ApplicationFeeClient'

export default function ApplicationFeeManager() {
  const [fees, setFees] = useState<ApplicationFee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingFee, setEditingFee] = useState<ApplicationFee | null>(null)
  const [newAmount, setNewAmount] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newPaymentMode, setNewPaymentMode] = useState<'test' | 'live'>('test')

  useEffect(() => {
    loadFees()
  }, [])

  const loadFees = async () => {
    try {
      setIsLoading(true)
      const feesData = await applicationFeeClient.getAllFees()
      setFees(feesData)
    } catch (error) {
      console.error('Failed to load application fees:', error)
      setError('Failed to load application fees')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditFee = (fee: ApplicationFee) => {
    setEditingFee(fee)
    setNewAmount(fee.amount_usd.toString())
    setNewDescription(fee.description || '')
    setNewPaymentMode('test') // Default to test mode
  }

  const handleUpdateFee = async () => {
    if (!editingFee) return

    try {
      setError(null)
      
      const response = await fetch('/api/admin/application-fees', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feeId: editingFee.id,
          amount: parseFloat(newAmount),
          description: newDescription,
          paymentMode: newPaymentMode
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update application fee')
      }

      // Reload fees
      await loadFees()
      setEditingFee(null)
      setNewAmount('')
      setNewDescription('')
    } catch (error) {
      console.error('Failed to update application fee:', error)
      setError(error instanceof Error ? error.message : 'Failed to update application fee')
    }
  }

  const handleCancelEdit = () => {
    setEditingFee(null)
    setNewAmount('')
    setNewDescription('')
    setNewPaymentMode('test')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading application fees...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Application Fee Management</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Application Fees</h3>
        </div>
        
        <div className="px-6 py-4">
          {fees.length === 0 ? (
            <p className="text-gray-500">No application fees found.</p>
          ) : (
            <div className="space-y-4">
              {fees.map((fee) => (
                <div key={fee.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">
                        {fee.fee_type.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {fee.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-2xl font-bold text-primary-600">
                          ${fee.amount_usd.toFixed(2)} USD
                        </span>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            fee.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {fee.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated: {new Date(fee.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => handleEditFee(fee)}
                        className="btn-primary text-sm"
                        disabled={!fee.is_active}
                      >
                        Edit Fee
                      </button>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editingFee?.id === fee.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (USD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            className="form-input"
                            placeholder="Enter amount"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="form-input"
                            placeholder="Enter description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Mode
                          </label>
                          <select
                            value={newPaymentMode}
                            onChange={(e) => setNewPaymentMode(e.target.value as 'test' | 'live')}
                            className="form-input"
                          >
                            <option value="test">Test Mode</option>
                            <option value="live">Live Mode</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={handleUpdateFee}
                          className="btn-primary text-sm"
                        >
                          Update Fee
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Important Notes</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Changes to application fees will affect new applications only</li>
          <li>• Existing pending applications will use the fee amount at the time of application</li>
          <li>• Only super admins can modify application fees</li>
          <li>• Fee changes are logged for audit purposes</li>
        </ul>
      </div>
    </div>
  )
}
