import { useState, useCallback } from 'react'

export interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export const useUndoRedo = <T,>(initialState: T) => {
  const [history, setHistory] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  })

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((prev) => {
      const nextPresent = typeof newState === 'function' ? (newState as (prev: T) => T)(prev.present) : newState
      
      if (JSON.stringify(nextPresent) === JSON.stringify(prev.present)) {
        return prev
      }

      return {
        past: [...prev.past, prev.present],
        present: nextPresent,
        future: [],
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev

      const newPast = prev.past.slice(0, -1)
      const newPresent = prev.past[prev.past.length - 1]
      const newFuture = [prev.present, ...prev.future]

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev

      const newFuture = prev.future.slice(1)
      const newPresent = prev.future[0]
      const newPast = [...prev.past, prev.present]

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      }
    })
  }, [])

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    })
  }, [])

  const canUndo = history.past.length > 0
  const canRedo = history.future.length > 0

  return {
    state: history.present,
    setState,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
    history,
  }
}
