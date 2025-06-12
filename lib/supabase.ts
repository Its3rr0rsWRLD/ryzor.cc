import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our backup system
export interface BackupData {
  id: string
  user_id: string
  type: 'full' | 'servers' | 'settings'
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  size: string
  progress: number
  data: any
  discord_user_id: string
}

// Backup management functions
export class BackupManager {
  static async getUserBackups(userId: string): Promise<BackupData[]> {
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  static async createBackup(backup: Partial<BackupData>): Promise<BackupData> {
    const { data, error } = await supabase
      .from('backups')
      .insert(backup)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateBackup(id: string, updates: Partial<BackupData>): Promise<BackupData> {
    const { data, error } = await supabase
      .from('backups')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteBackup(id: string): Promise<void> {
    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  static async getBackup(id: string): Promise<BackupData | null> {
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }

  static async checkBackupLimit(userId: string): Promise<{ count: number, canCreate: boolean, oldestBackup?: BackupData }> {
    const backups = await this.getUserBackups(userId)
    const count = backups.length
    const canCreate = count < 3
    const oldestBackup = count >= 3 ? backups[backups.length - 1] : undefined
    
    return { count, canCreate, oldestBackup }
  }
}