import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { snippetsService, type CreateSnippet, type Snippet, type UpdateSnippet } from '../lib/services'

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadSnippets()
    }
  }, [user])

  const loadSnippets = async () => {
    try {
      setLoading(true)
      const data = await snippetsService.getByUserId(user!.id)
      setSnippets(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error loading snippets'))
    } finally {
      setLoading(false)
    }
  }

  const createSnippet = async (snippet: CreateSnippet) => {
    try {
      const newSnippet = await snippetsService.create(snippet)
      setSnippets(prev => [newSnippet, ...prev])
      return newSnippet
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error creating snippet'))
      throw err
    }
  }

  const updateSnippet = async (id: string, snippet: UpdateSnippet) => {
    try {
      const updatedSnippet = await snippetsService.update(id, snippet)
      setSnippets(prev => prev.map(s => s.id === id ? updatedSnippet : s))
      return updatedSnippet
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error updating snippet'))
      throw err
    }
  }

  const deleteSnippet = async (id: string) => {
    try {
      await snippetsService.delete(id)
      setSnippets(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error deleting snippet'))
      throw err
    }
  }

  return {
    snippets,
    loading,
    error,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    refreshSnippets: loadSnippets
  }
} 