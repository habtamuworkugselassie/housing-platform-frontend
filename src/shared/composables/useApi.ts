/**
 * Shared API Composable
 * 
 * Provides a consistent way to make API calls with loading and error states.
 */
import { ref, Ref } from 'vue'
import api from '@/shared/api/client'
import type { AxiosResponse } from 'axios'

export interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useApi<T = any>() {
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)
  const data: Ref<T | null> = ref(null)

  const execute = async (
    apiCall: () => Promise<AxiosResponse<T>>,
    options: UseApiOptions = {}
  ): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await apiCall()
      data.value = response.data
      
      if (options.onSuccess) {
        options.onSuccess(response.data)
      }
      
      return response.data
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred'
      error.value = errorMessage
      
      if (options.onError) {
        options.onError(err)
      }
      
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}
