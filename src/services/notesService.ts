import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

// Extender el tipo Note para incluir is_favorite
type Note = Database['public']['Tables']['notes']['Row'] & {
  is_favorite?: boolean;
};

type CreateNote = Database['public']['Tables']['notes']['Insert'] & {
  is_favorite?: boolean;
};

type UpdateNote = Database['public']['Tables']['notes']['Update'] & {
  is_favorite?: boolean;
};

export { type CreateNote, type Note, type UpdateNote };

export const notesService = {
  // Obtener todas las notas del usuario
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(note => ({
      ...note,
      is_favorite: note.is_favorite || false
    })) as Note[];
  },

  // Crear una nueva nota
  async createNote(note: CreateNote) {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...note,
        is_favorite: note.is_favorite || false
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      is_favorite: data.is_favorite || false
    } as Note;
  },

  // Actualizar una nota
  async updateNote(id: string, note: UpdateNote) {
    const { data, error } = await supabase
      .from('notes')
      .update({
        ...note,
        is_favorite: note.is_favorite
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      is_favorite: data.is_favorite || false
    } as Note;
  },

  // Eliminar una nota
  async deleteNote(id: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Buscar notas
  async searchNotes(query: string) {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data as Note[];
  }
}; 