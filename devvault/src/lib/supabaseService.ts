import { Database } from './database.types'
import { supabase } from './supabase'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

export class SupabaseService<T extends TableName> {
  constructor(private tableName: T) {}

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Tables[T]['Row'][]
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Tables[T]['Row']
  }

  async create(item: Tables[T]['Insert']) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data as Tables[T]['Row']
  }

  async update(id: string, item: Tables[T]['Update']) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(item)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Tables[T]['Row']
  }

  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Tables[T]['Row'][]
  }
} 