'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface SignatureCaptureProps {
  onSignatureComplete: (signature: string) => void
  onSignatureClear: () => void
  signatureData: string | null
}

interface Point {
  x: number
  y: number
}

export default function SignatureCapture({ 
  onSignatureComplete, 
  onSignatureClear, 
  signatureData 
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set drawing styles
    ctx.strokeStyle = '#1f2937' // gray-800
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load existing signature if available
    if (signatureData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height)
        setHasSignature(true)
      }
      img.src = signatureData
    }
  }, [signatureData])

  // Get point coordinates from event
  const getPointFromEvent = useCallback((event: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    }
  }, [])

  // Start drawing
  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    event.preventDefault()
    const point = getPointFromEvent(event)
    setIsDrawing(true)
    setLastPoint(point)
    setHasSignature(true)
  }, [getPointFromEvent])

  // Draw line
  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || !lastPoint) return
    
    event.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const currentPoint = getPointFromEvent(event)
    
    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()
    
    setLastPoint(currentPoint)
  }, [isDrawing, lastPoint, getPointFromEvent])

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    setLastPoint(null)
    
    // Save signature
    const canvas = canvasRef.current
    if (canvas && hasSignature) {
      const signatureDataUrl = canvas.toDataURL('image/png')
      onSignatureComplete(signatureDataUrl)
    }
  }, [isDrawing, hasSignature, onSignatureComplete])

  // Clear signature
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    setHasSignature(false)
    setIsDrawing(false)
    setLastPoint(null)
    onSignatureClear()
  }, [onSignatureClear])

  // Mouse events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => startDrawing(e)
    const handleMouseMove = (e: MouseEvent) => draw(e)
    const handleMouseUp = () => stopDrawing()
    const handleMouseLeave = () => stopDrawing()

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [startDrawing, draw, stopDrawing])

  // Touch events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleTouchStart = (e: TouchEvent) => startDrawing(e)
    const handleTouchMove = (e: TouchEvent) => draw(e)
    const handleTouchEnd = () => stopDrawing()

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
    }
  }, [startDrawing, draw, stopDrawing])

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Digital Signature
          </label>
          <p className="text-sm text-gray-500">
            Please sign in the box below using your mouse or touch screen
          </p>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-48 border border-gray-300 rounded cursor-crosshair bg-white"
            style={{ touchAction: 'none' }}
          />
          
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-gray-400 text-center">
                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <p className="text-sm">Sign here</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Signature
          </button>
          
          <div className="flex items-center text-sm text-gray-500">
            {hasSignature ? (
              <div className="flex items-center text-green-600">
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Signature captured
              </div>
            ) : (
              <span>No signature</span>
            )}
          </div>
        </div>
      </div>

      {/* Signature Validation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Signature Security</h4>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Your signature will be encrypted and securely stored</li>
                <li>Timestamp and IP address will be recorded for verification</li>
                <li>This signature has the same legal validity as a handwritten signature</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}