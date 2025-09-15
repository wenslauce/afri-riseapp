'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveOptions {
  data: any
  onSave: (data: any) => Promise<void>
  delay?: number
  enabled?: boolean
}

export function useAutoSave({ data, onSave, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedDataRef = useRef<string>()
  const isSavingRef = useRef(false)

  const save = useCallback(async () => {
    if (isSavingRef.current) return
    
    const currentDataString = JSON.stringify(data)
    
    // Don't save if data hasn't changed
    if (lastSavedDataRef.current === currentDataString) return
    
    try {
      isSavingRef.current = true
      await onSave(data)
      lastSavedDataRef.current = currentDataString
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      isSavingRef.current = false
    }
  }, [data, onSave])

  useEffect(() => {
    if (!enabled) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(save, delay)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, save, delay, enabled])

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      if (enabled && !isSavingRef.current) {
        save()
      }
    }
  }, [save, enabled])

  return {
    save: () => save(),
    isSaving: isSavingRef.current
  }
}