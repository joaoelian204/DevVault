import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { notesService, type CreateNote, type Note, type UpdateNote } from '../lib/services'

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadNotes()
    }
  }, [user])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const data = await notesService.getByUserId(user!.id)
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error loading notes'))
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (note: CreateNote) => {
    try {
      const newNote = await notesService.create(note)
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error creating note'))
      throw err
    }
  }

  const updateNote = async (id: string, note: UpdateNote) => {
    try {
      const updatedNote = await notesService.update(id, note)
      setNotes(prev => prev.map(n => n.id === id ? updatedNote : n))
      return updatedNote
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error updating note'))
      throw err
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await notesService.delete(id)
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error deleting note'))
      throw err
    }
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes: loadNotes
  }
} 