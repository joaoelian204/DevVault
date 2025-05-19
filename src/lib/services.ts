import { Database } from './database.types'
import { SupabaseService } from './supabaseService'

type Tables = Database['public']['Tables']

export const linksService = new SupabaseService<'links'>('links')
export const snippetsService = new SupabaseService<'snippets'>('snippets')
export const notesService = new SupabaseService<'notes'>('notes')
export const profilesService = new SupabaseService<'profiles'>('profiles')

// Tipos exportados para uso en componentes
export type Link = Tables['links']['Row']
export type Snippet = Tables['snippets']['Row']
export type Note = Tables['notes']['Row']
export type Profile = Tables['profiles']['Row']

export type CreateLink = Tables['links']['Insert']
export type CreateSnippet = Tables['snippets']['Insert']
export type CreateNote = Tables['notes']['Insert']
export type CreateProfile = Tables['profiles']['Insert']

export type UpdateLink = Tables['links']['Update']
export type UpdateSnippet = Tables['snippets']['Update']
export type UpdateNote = Tables['notes']['Update']
export type UpdateProfile = Tables['profiles']['Update'] 