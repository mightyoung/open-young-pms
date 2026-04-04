/**
 * useUrlFilters — syncs filter state with URL search params.
 * Prevents stale closures in useEffect by tracking previous filters.
 */
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * @param {Object} options
 * @param {Object} options.initialValues - Default filter values (used when URL has no params)
 * @param {string[]} options.paramNames - Array of filter param names to sync
 * @returns {[Object, Function]} [filters, setFilters]
 */
export function useUrlFilters({ initialValues = {}, paramNames = [] } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Build initial filters from URL params, falling back to defaults
  const getInitialFilters = () => {
    const filters = { ...initialValues }
    paramNames.forEach(key => {
      const val = searchParams.get(key)
      if (val !== null) {
        // Handle comma-separated arrays (e.g. ?status=pending,assigned)
        filters[key] = val.includes(',') ? val.split(',') : val
      }
    })
    return filters
  }

  const [filters, setFiltersInternal] = useState(getInitialFilters)
  const prevFiltersRef = useRef(filters)

  // Sync filters → URL params (only when filters actually change)
  useEffect(() => {
    const prev = prevFiltersRef.current
    const hasChanged = paramNames.some(key => {
      const prevVal = prev[key]
      const currVal = filters[key]
      if (Array.isArray(prevVal) && Array.isArray(currVal)) {
        return JSON.stringify(prevVal) !== JSON.stringify(currVal)
      }
      return prevVal !== currVal
    })
    if (!hasChanged) return

    const newParams = new URLSearchParams()
    paramNames.forEach(key => {
      const val = filters[key]
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          newParams.set(key, val.join(','))
        } else {
          newParams.set(key, String(val))
        }
      }
    })
    setSearchParams(newParams, { replace: true })
    prevFiltersRef.current = filters
  }, [filters, paramNames, setSearchParams])

  const setFilters = (updater) => {
    const newFilters = typeof updater === 'function' ? updater(filters) : updater
    prevFiltersRef.current = filters
    setFiltersInternal(newFilters)
  }

  return [filters, setFilters]
}
