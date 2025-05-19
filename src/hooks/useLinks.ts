import { useCallback, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export function useLinks() {
  const { user } = useAuth()
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setLinks(data || [])
    setLoading(false)
  }, [user])

  const getLink = async (id: string) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()
    if (error) throw error
    return data
  }

  const addLink = async (link: any) => {
    if (!user) {
      console.log('No hay usuario autenticado');
      return;
    }
    try {
      console.log('Insertando link:', {
        ...link,
        user_id: user.id,
        tags: link.tags ? link.tags.split(',').map((t: string) => t.trim()) : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      const { error } = await supabase.from('links').insert({
        ...link,
        user_id: user.id,
        tags: link.tags ? link.tags.split(',').map((t: string) => t.trim()) : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      await fetchLinks()
    } catch (err: any) {
      setError('Error al guardar: ' + (err?.message || JSON.stringify(err)))
    }
  }

  const updateLink = async (id: string, link: any) => {
    if (!user) return
    try {
      setLoading(true)
    const { error } = await supabase.from('links').update({
      ...link,
      tags: link.tags ? link.tags.split(',').map((t: string) => t.trim()) : [],
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) throw error
    await fetchLinks()
    } catch (err: any) {
      setError('Error al actualizar: ' + (err?.message || JSON.stringify(err)))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteLink = async (id: string) => {
    if (!user) return
    try {
      setLoading(true)
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (error) throw error
    await fetchLinks()
    } catch (err: any) {
      setError('Error al eliminar: ' + (err?.message || JSON.stringify(err)))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { links, loading, fetchLinks, addLink, updateLink, deleteLink, getLink, error }
} 