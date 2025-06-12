import { NextResponse } from "next/server"
import { BackupManager } from "@/lib/supabase"
import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { action, token, backupType, backupId, solverKey, proxies } = await req.json()

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing Discord token" }, { status: 400 })
    }

    // Create a per-request Supabase client using server-side .env config
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // or SUPABASE_SECRET_KEY if that's your .env var
    )

    // Verify Discord token
    const userRes = await fetch("https://discord.com/api/v9/users/@me", {
      headers: { "Authorization": token }
    })

    if (!userRes.ok) {
      return NextResponse.json({ ok: false, error: "Invalid Discord token" }, { status: 401 })
    }

    const discordUser = await userRes.json()

    switch (action) {
      case "start_backup":
        if (!backupType) {
          return NextResponse.json({ ok: false, error: "Backup type required" }, { status: 400 })
        }

        // Check backup limit and show popup if needed
        const { count, canCreate, oldestBackup } = await BackupManager.checkBackupLimit(discordUser.id)
        
        if (!canCreate && oldestBackup) {
          return NextResponse.json({ 
            ok: false, 
            error: "backup_limit_reached",
            message: "You have reached the maximum of 3 backups. The oldest backup will be deleted to create a new one.",
            oldestBackup: {
              id: oldestBackup.id,
              type: oldestBackup.type,
              created_at: oldestBackup.created_at
            }
          }, { status: 400 })
        }

        // If we're at the limit, delete the oldest backup
        if (count >= 3 && oldestBackup) {
          await BackupManager.deleteBackup(oldestBackup.id)
        }

        const newBackup = await BackupManager.createBackup({
          user_id: discordUser.id,
          discord_user_id: discordUser.id,
          type: backupType as 'full' | 'servers' | 'settings',
          status: 'running',
          size: "0 MB",
          progress: 0,
          data: null
        })

        // Start actual backup process
        performBackup(newBackup.id, backupType, token, discordUser)

        return NextResponse.json({
          ok: true,
          message: `${backupType} backup started`,
          backupId: newBackup.id,
          estimatedTime: backupType === 'full' ? '10-15 minutes' : '2-5 minutes'
        })

      case "confirm_backup_with_deletion":
        // This handles the confirmed backup creation when user accepts deletion
        if (!backupType) {
          return NextResponse.json({ ok: false, error: "Backup type required" }, { status: 400 })
        }

        const { count: confirmCount, oldestBackup: confirmOldest } = await BackupManager.checkBackupLimit(discordUser.id)
        
        // Delete the oldest backup
        if (confirmCount >= 3 && confirmOldest) {
          await BackupManager.deleteBackup(confirmOldest.id)
        }

        const confirmedBackup = await BackupManager.createBackup({
          user_id: discordUser.id,
          discord_user_id: discordUser.id,
          type: backupType as 'full' | 'servers' | 'settings',
          status: 'running',
          size: "0 MB",
          progress: 0,
          data: null
        })

        // Start actual backup process
        performBackup(confirmedBackup.id, backupType, token, discordUser)

        return NextResponse.json({
          ok: true,
          message: `${backupType} backup started (oldest backup deleted)`,
          backupId: confirmedBackup.id,
          estimatedTime: backupType === 'full' ? '10-15 minutes' : '2-5 minutes'
        })

      case "get_status":
        if (!backupId) {
          return NextResponse.json({ ok: false, error: "Backup ID required" }, { status: 400 })
        }

        const backup = await BackupManager.getBackup(backupId)
        if (!backup || backup.user_id !== discordUser.id) {
          return NextResponse.json({ ok: false, error: "Backup not found" }, { status: 404 })
        }

        return NextResponse.json({
          ok: true,
          backup
        })

      case "list_backups":
        const backups = await BackupManager.getUserBackups(discordUser.id)
        return NextResponse.json({
          ok: true,
          backups
        })

      case "download_backup":
        if (!backupId) {
          return NextResponse.json({ ok: false, error: "Backup ID required" }, { status: 400 })
        }

        const downloadBackup = await BackupManager.getBackup(backupId)
        if (!downloadBackup || downloadBackup.user_id !== discordUser.id) {
          return NextResponse.json({ ok: false, error: "Backup not found" }, { status: 404 })
        }

        if (downloadBackup.status !== 'completed') {
          return NextResponse.json({ ok: false, error: "Backup not completed" }, { status: 400 })
        }

        return NextResponse.json({
          ok: true,
          data: downloadBackup.data,
          size: downloadBackup.size,
          type: downloadBackup.type
        })

      case "delete_backup":
        if (!backupId) {
          return NextResponse.json({ ok: false, error: "Backup ID required" }, { status: 400 })
        }

        const deleteBackup = await BackupManager.getBackup(backupId)
        if (!deleteBackup || deleteBackup.user_id !== discordUser.id) {
          return NextResponse.json({ ok: false, error: "Backup not found" }, { status: 404 })
        }

        await BackupManager.deleteBackup(backupId)

        return NextResponse.json({
          ok: true,
          message: "Backup deleted successfully"
        })

      case "restore_backup":
        if (!backupId) {
          return NextResponse.json({ ok: false, error: "Backup ID required" }, { status: 400 })
        }
        const restoreBackup = await BackupManager.getBackup(backupId)
        if (!restoreBackup || restoreBackup.user_id !== discordUser.id) {
          return NextResponse.json({ ok: false, error: "Backup not found" }, { status: 404 })
        }
        if (restoreBackup.status !== 'completed') {
          return NextResponse.json({ ok: false, error: "Backup not completed" }, { status: 400 })
        }
        try {
          // Pass proxies to performRestore and updateUserProfile
          const restoreResult = await performRestore(discordUser.id, backupId, token, solverKey, proxies)

          // Check for PATCH/captcha errors in profile changes
          const failedProfileChange = restoreResult.changes.profile.find((c: any) => c.status === 'failed' && c.error && c.error.includes('CapSolver key'))
          if (failedProfileChange) {
            return NextResponse.json({
              ok: false,
              error: failedProfileChange.error
            }, { status: 400 })
          }

          return NextResponse.json({
            ok: true,
            message: "Restore completed successfully",
            changes: restoreResult.changes,
            summary: restoreResult.summary
          })
        } catch (err: any) {
          // Always return 400 for CapSolver/proxy errors, never 200
          if (err.message && (err.message.includes('CapSolver') || err.message.includes('proxy') || err.message.includes('proxies') || err.message.includes('No proxies set'))) {
            return NextResponse.json({ ok: false, error: err.message }, { status: 400 })
          }
          // For all other errors, return 500
          return NextResponse.json({ ok: false, error: err.message || 'Restore failed' }, { status: 500 })
        }

      default:
        return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
    }
    // If for any reason the switch does not return, force a 500 error
    return NextResponse.json({ ok: false, error: "Unknown server error (no response returned)" }, { status: 500 })
  } catch (e: any) {
    console.error('Backup API error:', e)
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

// Perform actual backup
async function performBackup(backupId: string, backupType: string, token: string, discordUser: any) {
  try {
    const backupData: any = {
      timestamp: new Date().toISOString(),
      userId: discordUser.id,
      type: backupType
    }

    // Get user profile data
    let progress = 10
    const profileData = await getUserProfile(token)
    if (backupType === 'full' || backupType === 'settings') {
      // Download profile picture and banner
      progress = 20
      const mediaFiles = await downloadUserMedia(profileData, backupId)
      backupData.profile = { ...profileData, media: mediaFiles }
      // Get user settings
      progress = 30
      backupData.settings = await getUserSettings(token)
      // Get saved content
      progress = 40
      backupData.savedContent = await getSavedContent(token)
    }
    if (backupType === 'full' || backupType === 'servers') {
      // Get server data
      progress = 70
      backupData.servers = await getServerData(token)
    }

    // Save backup data to Supabase
    progress = 90
    await BackupManager.updateBackup(backupId, {
      status: 'completed',
      progress: 100,
      size: JSON.stringify(backupData).length / 1024 / 1024 + ' MB',
      data: {
        itemCount: Object.keys(backupData).length,
        lastUpdated: new Date().toISOString(),
        backupData
      }
    })
  } catch (error) {
    console.error('Backup failed:', error)
    await BackupManager.updateBackup(backupId, {
      status: 'failed',
      progress: 0
    })
  }
}

async function getUserProfile(token: string) {
  const response = await fetch("https://discord.com/api/v9/users/@me", {
    headers: { "Authorization": token }
  })
  
  if (!response.ok) throw new Error('Failed to fetch user profile')
  
  const profile = await response.json()
  
  return {
    id: profile.id,
    username: profile.username,
    discriminator: profile.discriminator,
    globalName: profile.global_name,
    displayName: profile.display_name,
    avatar: profile.avatar,
    banner: profile.banner,
    bannerColor: profile.banner_color,
    accentColor: profile.accent_color,
    bio: profile.bio,
    pronouns: profile.pronouns,
    email: profile.email,
    phone: profile.phone,
    verified: profile.verified,
    mfaEnabled: profile.mfa_enabled,
    locale: profile.locale,
    flags: profile.flags,
    premiumType: profile.premium_type,
    publicFlags: profile.public_flags
  }
}

async function downloadUserMedia(profile: any, backupId: string) {
  const mediaFiles: any = {}
  
  try {
    // Download avatar
    if (profile.avatar) {
      const avatarUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${profile.avatar.startsWith('a_') ? 'gif' : 'png'}?size=1024`
      const avatarBuffer = await downloadFile(avatarUrl)
      mediaFiles.avatar = {
        filename: `avatar.${profile.avatar.startsWith('a_') ? 'gif' : 'png'}`,
        size: avatarBuffer.length,
        data: avatarBuffer.toString('base64')
      }
    }
    
    // Download banner
    if (profile.banner) {
      const bannerUrl = `https://cdn.discordapp.com/banners/${profile.id}/${profile.banner}.${profile.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024`
      const bannerBuffer = await downloadFile(bannerUrl)
      mediaFiles.banner = {
        filename: `banner.${profile.banner.startsWith('a_') ? 'gif' : 'png'}`,
        size: bannerBuffer.length,
        data: bannerBuffer.toString('base64')
      }
    }
  } catch (error) {
    console.error('Error downloading media:', error)
  }
  
  return mediaFiles
}

async function downloadFile(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download: ${url}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function getUserSettings(token: string) {
  try {
    const response = await fetch("https://discord.com/api/v9/users/@me/settings", {
      headers: { "Authorization": token }
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
  }
  return null
}

async function getSavedContent(token: string) {
  const savedContent: any = {}
  
  try {
    // Get user's sticker packs
    const stickerResponse = await fetch("https://discord.com/api/v9/users/@me/sticker-packs", {
      headers: { "Authorization": token }
    })
    if (stickerResponse.ok) {
      savedContent.stickerPacks = await stickerResponse.json()
    }
    
    // Get favorite GIFs (this endpoint may not be available)
    try {
      const gifsResponse = await fetch("https://discord.com/api/v9/gifs/search/trending?provider=tenor&locale=en-US&media_format=gif", {
        headers: { "Authorization": token }
      })
      if (gifsResponse.ok) {
        savedContent.favoriteGifs = await gifsResponse.json()
      }
    } catch (e) {
      // GIFs endpoint might not be accessible
    }
    
    // Get user connections
    const connectionsResponse = await fetch("https://discord.com/api/v9/users/@me/connections", {
      headers: { "Authorization": token }
    })
    if (connectionsResponse.ok) {
      savedContent.connections = await connectionsResponse.json()
    }
    
  } catch (error) {
    console.error('Error fetching saved content:', error)
  }
  
  return savedContent
}

async function getServerData(token: string) {
  try {
    const guildsResponse = await fetch("https://discord.com/api/v9/users/@me/guilds", {
      headers: { "Authorization": token }
    })
    
    if (!guildsResponse.ok) return null
    
    const guilds = await guildsResponse.json()
    
    return {
      guilds: guilds,
      guildCount: guilds.length
    }
  } catch (error) {
    console.error('Error fetching server data:', error)
    return null
  }
}

async function saveBackupData(backupId: string, data: any) {
  try {
    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups')
    await fs.mkdir(backupDir, { recursive: true })
    
    // Save backup data to JSON file
    const backupFilePath = path.join(backupDir, `${backupId}.json`)
    const backupJson = JSON.stringify(data, null, 2)
    await fs.writeFile(backupFilePath, backupJson, 'utf8')
    
    console.log(`Backup ${backupId} saved to file (${backupJson.length} characters)`)
  } catch (error) {
    console.error(`Failed to save backup ${backupId}:`, error)
    throw error
  }
}

async function calculateActualBackupSize(backupId: string): Promise<string> {
  try {
    const backupDir = path.join(process.cwd(), 'backups')
    const backupFilePath = path.join(backupDir, `${backupId}.json`)
    const stats = await fs.stat(backupFilePath)
    const sizeMB = stats.size / 1024 / 1024
    return `${sizeMB.toFixed(2)} MB`
  } catch (error) {
    console.error(`Error calculating backup size for ${backupId}:`, error)
    return "0 MB"
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 })
    }

    const userRes = await fetch("https://discord.com/api/v9/users/@me", {
      headers: { "Authorization": token }
    })

    if (!userRes.ok) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await userRes.json()
    const userBackups = await BackupManager.getUserBackups(user.id)

    return NextResponse.json({
      ok: true,
      backupCount: userBackups.length,
      totalSize: userBackups.reduce((total, backup) => {
        const size = parseFloat(backup.size.replace(/[^\d.]/g, ''))
        return total + (isNaN(size) ? 0 : size)
      }, 0).toFixed(1) + " MB" || "0 MB",
      capabilities: {
        maxBackups: 10,
        supportedTypes: ['full', 'servers', 'settings'],
        formats: ['JSON', 'ZIP'],
        features: [
          'Profile pictures and banners',
          'User settings and preferences',
          'Server memberships',
          'Connections and integrations',
          'Sticker collections'
        ]      }
    })

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

// Perform restore from backup
async function performRestore(userId: string, backupId: string, token: string, solverKey?: string, userProxies?: string[]) {
  try {
    // Load backup data from Supabase
    const backup = await BackupManager.getBackup(backupId)
    if (!backup || backup.user_id !== userId) {
      throw new Error('Backup not found or not authorized')
    }
    if (!backup.data || !backup.data.backupData) {
      throw new Error('No backup data found in Supabase')
    }
    const backupData = backup.data.backupData
    // Get current state
    const currentProfile = await getUserProfile(token)
    const currentServers = await getServerData(token)
    const currentSettings = await getUserSettings(token)
    const changes: any = {
      profile: [],
      servers: {
        toJoin: [],
        differences: []
      },
      settings: []
    }
    let totalChanges = 0
    // Compare and restore profile data
    if (backupData.profile && (backupData.type === 'full' || backupData.type === 'settings')) {
      const profileChanges = await compareAndRestoreProfile(backupData.profile, currentProfile, token, solverKey, userProxies)
      changes.profile = profileChanges
      totalChanges += profileChanges.length
    }
    // Compare and restore server memberships
    if (backupData.servers && (backupData.type === 'full' || backupData.type === 'servers')) {
      const serverChanges = await compareAndRestoreServers(backupData.servers, currentServers, token)
      changes.servers = serverChanges
      totalChanges += serverChanges.toJoin.length
    }
    // Compare and restore settings
    if (backupData.settings && (backupData.type === 'full' || backupData.type === 'settings')) {
      const settingsChanges = await compareAndRestoreSettings(backupData.settings, currentSettings, token)
      changes.settings = settingsChanges
      totalChanges += settingsChanges.length
    }
    return {
      changes,
      summary: {
        totalChanges,
        profileUpdates: changes.profile.length,
        serversToJoin: changes.servers.toJoin?.length || 0,
        settingsUpdates: changes.settings.length,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('Restore failed:', error)
    throw new Error(`Restore failed: ${error.message}`)
  }
}

// Compare and restore profile data
async function compareAndRestoreProfile(backupProfile: any, currentProfile: any, token: string, solverKey?: string, userProxies?: string[]) {
  const changes: any[] = []
  
  try {    // Compare display name/global name
    if (backupProfile.globalName && backupProfile.globalName !== currentProfile.globalName) {
      const updateResult = await updateUserProfile(token, { global_name: backupProfile.globalName }, solverKey, userProxies)
      if (updateResult.success) {
        changes.push({
          field: 'globalName',
          oldValue: currentProfile.globalName,
          newValue: backupProfile.globalName,
          status: 'updated'
        })
      }
    }
    
    // Compare bio
    if (backupProfile.bio && backupProfile.bio !== currentProfile.bio) {
      const updateResult = await updateUserProfile(token, { bio: backupProfile.bio }, solverKey, userProxies)
      if (updateResult.success) {
        changes.push({
          field: 'bio',
          oldValue: currentProfile.bio,
          newValue: backupProfile.bio,
          status: 'updated'
        })
      }
    }
      // Compare pronouns
    if (backupProfile.pronouns && backupProfile.pronouns !== currentProfile.pronouns) {
      const updateResult = await updateUserProfile(token, { pronouns: backupProfile.pronouns }, solverKey, userProxies)
      if (updateResult.success) {
        changes.push({
          field: 'pronouns',
          oldValue: currentProfile.pronouns,
          newValue: backupProfile.pronouns,
          status: 'updated'
        })
      }
    }
      // Restore avatar if it exists in backup and is different
    if (backupProfile.avatar && backupProfile.avatar !== currentProfile.avatar) {
      try {
        if (backupProfile.media && backupProfile.media.avatar && backupProfile.media.avatar.data) {
          const avatarData = `data:image/${backupProfile.media.avatar.filename.includes('gif') ? 'gif' : 'png'};base64,${backupProfile.media.avatar.data}`
          const updateResult = await updateUserProfile(token, { avatar: avatarData }, solverKey, userProxies)
          if (updateResult.success) {
            changes.push({
              field: 'avatar',
              oldValue: currentProfile.avatar,
              newValue: 'restored from backup',
              status: 'updated'
            })
          } else {
            changes.push({
              field: 'avatar',
              error: 'Failed to update avatar',
              status: 'failed'
            })
          }
        } else {
          // Try to download the avatar from Discord CDN and set it
          const avatarUrl = `https://cdn.discordapp.com/avatars/${backupProfile.id}/${backupProfile.avatar}.${backupProfile.avatar.startsWith('a_') ? 'gif' : 'png'}?size=512`
          const avatarResponse = await fetch(avatarUrl)
          if (avatarResponse.ok) {
            const avatarBuffer = await avatarResponse.arrayBuffer()
            const extension = backupProfile.avatar.startsWith('a_') ? 'gif' : 'png'
            const avatarBase64 = `data:image/${extension};base64,${Buffer.from(avatarBuffer).toString('base64')}`
            const updateResult = await updateUserProfile(token, { avatar: avatarBase64 }, solverKey, userProxies)
            if (updateResult.success) {
              changes.push({
                field: 'avatar',
                oldValue: currentProfile.avatar,
                newValue: backupProfile.avatar,
                status: 'updated'
              })
            } else {
              changes.push({
                field: 'avatar',
                error: 'Failed to update avatar',
                status: 'failed'
              })
            }
          }
        }
      } catch (error: any) {
        changes.push({
          field: 'avatar',
          error: error.message,
          status: 'failed'
        })
      }
    }
    // Restore banner if it exists in backup and is different
    if (backupProfile.banner && backupProfile.banner !== currentProfile.banner) {
      try {
        if (backupProfile.media && backupProfile.media.banner && backupProfile.media.banner.data) {
          const bannerData = `data:image/${backupProfile.media.banner.filename.includes('gif') ? 'gif' : 'png'};base64,${backupProfile.media.banner.data}`
          const updateResult = await updateUserProfile(token, { banner: bannerData }, solverKey, userProxies)
          if (updateResult.success) {
            changes.push({
              field: 'banner',
              oldValue: currentProfile.banner,
              newValue: 'restored from backup',
              status: 'updated'
            })
          } else {
            changes.push({
              field: 'banner',
              error: 'Failed to update banner',
              status: 'failed'
            })
          }
        } else {
          // Try to download the banner from Discord CDN and set it
          const bannerUrl = `https://cdn.discordapp.com/banners/${backupProfile.id}/${backupProfile.banner}.${backupProfile.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024`
          const bannerResponse = await fetch(bannerUrl)
          if (bannerResponse.ok) {
            const bannerBuffer = await bannerResponse.arrayBuffer()
            const extension = backupProfile.banner.startsWith('a_') ? 'gif' : 'png'
            const bannerBase64 = `data:image/${extension};base64,${Buffer.from(bannerBuffer).toString('base64')}`
            const updateResult = await updateUserProfile(token, { banner: bannerBase64 }, solverKey, userProxies)
            if (updateResult.success) {
              changes.push({
                field: 'banner',
                oldValue: currentProfile.banner,
                newValue: backupProfile.banner,
                status: 'updated'
              })
            } else {
              changes.push({
                field: 'banner',
                error: 'Failed to update banner',
                status: 'failed'
              })
            }
          }
        }
      } catch (error: any) {
        changes.push({
          field: 'banner',
          error: error.message,
          status: 'failed'
        })
      }
    }
      } catch (error: any) {
    console.error('Profile restore error:', error)
    changes.push({
      field: 'profile',
      error: error.message,
      status: 'failed'
    })
  }
  
  return changes
}

// Compare and restore server memberships
async function compareAndRestoreServers(backupServers: any, currentServers: any, token: string) {
  const changes: {
    toJoin: any[],
    differences: any[]
  } = {
    toJoin: [],
    differences: []
  }
  try {
    if (!backupServers.guilds || !currentServers.guilds) {
      return changes
    }
    const currentGuildIds = new Set(currentServers.guilds.map((g: any) => g.id))
    const backupGuildIds = new Set(backupServers.guilds.map((g: any) => g.id))
    // Find servers to rejoin
    for (const backupGuild of backupServers.guilds) {
      if (!currentGuildIds.has(backupGuild.id)) {
        changes.toJoin.push({
          id: backupGuild.id,
          name: backupGuild.name,
          icon: backupGuild.icon,
          status: 'needs_invite',
          message: 'Server not found in current memberships - manual rejoin required'
        })
      }
    }
    // Find servers that are new (not in backup)
    for (const currentGuild of currentServers.guilds) {
      if (!backupGuildIds.has(currentGuild.id)) {
        changes.differences.push({
          id: currentGuild.id,
          name: currentGuild.name,
          status: 'new_server',
          message: 'This server was joined after the backup was created'
        })
      }
    }
  } catch (error: any) {
    console.error('Server restore error:', error)
  }
  return changes
}

// Compare and restore settings
async function compareAndRestoreSettings(backupSettings: any, currentSettings: any, token: string) {
  const changes: any[] = []
  try {
    // This would need to be implemented based on what settings are backed up
    // For now, we'll just note that settings comparison is available
    changes.push({
      field: 'settings',
      message: 'Settings comparison available - manual review recommended',
      backupData: Object.keys(backupSettings || {}),
      status: 'review_required'
    })
  } catch (error: any) {
    console.error('Settings restore error:', error)
    changes.push({
      field: 'settings',
      error: error.message,
      status: 'failed'
    })
  }
  return changes
}

// Update user profile via Discord API
async function updateUserProfile(token: string, updates: any, solverKey?: string, userProxies?: string[]) {
  try {
    const response = await fetch('https://discord.com/api/v9/users/@me', {
      method: 'PATCH',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'accept': '*/*',
        'accept-language': 'en-US',
        'priority': 'u=1, i',
        'x-debug-options': 'bugReporterEnabled',
        'x-discord-locale': 'en-US',
        'x-discord-timezone': 'America/Chicago',
        'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MTk0Iiwib3NfdmVyc2lvbiI6IjEwLjAuMjI2MjEiLCJvc19hcmNoIjoieDY0IiwiYXBwX2FyY2giOiJ4NjQiLCJzeXN0ZW1fbG9jYWxlIjoiZW4tVVMiLCJoYXNfY2xpZW50X21vZHMiOmZhbHNlLCJjbGllbnRfbGF1bmNoX2lkIjoiN2ZiMWNmNzUtZTRiOC00NTRlLThmY2EtZTMxYjNkOThlOTUzIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgZGlzY29yZC8xLjAuOTE5NCBDaHJvbWUvMTM0LjAuNjk5OC4yMDUgRWxlY3Ryb24vMzUuMy4wIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIzNS4zLjAiLCJvc19zZGtfdmVyc2lvbiI6IjIyNjIxIiwiY2xpZW50X2J1aWxkX251bWJlciI6NDA3NzQyLCJuYXRpdmVfYnVpbGRfbnVtYmVyIjo2NDM2MCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwiY2xpZW50X2hlYXJ0YmVhdF9zZXNzaW9uX2lkIjoiZjI4NWU4ZDktNTZmOS00NzAyLWI4ZjQtZjUxODgxYjllMWE2IiwiY2xpZW50X2FwcF9zdGF0ZSI6ImZvY3VzZWQifQ=='
      },
      body: JSON.stringify(updates)
    })
    if (!response.ok) {
      let errorDetail
      try {
        errorDetail = await response.json()
      } catch (e) {
        errorDetail = await response.text()
      }
      console.error('Discord PATCH error:', errorDetail)
      if (errorDetail && errorDetail.captcha_key) {
        if (!solverKey) {
          throw new Error("You need to set your CapSolver key in General/Settings to restore your profile.")
        }
        // Pass userProxies to solveCaptcha
        const captchaSolution = await solveCaptcha(errorDetail, solverKey, userProxies)
        const retryResponse = await fetch('https://discord.com/api/v9/users/@me', {
          method: 'PATCH',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'accept': '*/*',
            'accept-language': 'en-US',
            'priority': 'u=1, i',
            'x-debug-options': 'bugReporterEnabled',
            'x-discord-locale': 'en-US',
            'x-discord-timezone': 'America/Chicago',
            'x-super-properties': 'eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjEuMC45MTk0Iiwib3NfdmVyc2lvbiI6IjEwLjAuMjI2MjEiLCJvc19hcmNoIjoieDY0IiwiYXBwX2FyY2giOiJ4NjQiLCJzeXN0ZW1fbG9jYWxlIjoiZW4tVVMiLCJoYXNfY2xpZW50X21vZHMiOmZhbHNlLCJjbGllbnRfbGF1bmNoX2lkIjoiN2ZiMWNmNzUtZTRiOC00NTRlLThmY2EtZTMxYjNkOThlOTUzIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgZGlzY29yZC8xLjAuOTE5NCBDaHJvbWUvMTM0LjAuNjk5OC4yMDUgRWxlY3Ryb24vMzUuMy4wIFNhZmFyaS81MzcuMzYiLCJicm93c2VyX3ZlcnNpb24iOiIzNS4zLjAiLCJvc19zZGtfdmVyc2lvbiI6IjIyNjIxIiwiY2xpZW50X2J1aWxkX251bWJlciI6NDA3NzQyLCJuYXRpdmVfYnVpbGRfbnVtYmVyIjo2NDM2MCwiY2xpZW50X2V2ZW50X3NvdXJjZSI6bnVsbCwiY2xpZW50X2hlYXJ0YmVhdF9zZXNzaW9uX2lkIjoiZjI4NWU4ZDktNTZmOS00NzAyLWI4ZjQtZjUxODgxYjllMWE2IiwiY2xpZW50X2FwcF9zdGF0ZSI6ImZvY3VzZWQifQ=='
          },
          body: JSON.stringify({
            ...updates,
            captcha_key: captchaSolution.captcha_key
          })
        })
        if (retryResponse.ok) {
          return { success: true }
        } else {
          const retryError = await retryResponse.json().catch(() => ({}))
          throw new Error(`Captcha solved but request still failed: ${retryError.message || 'Unknown error'}`)
        }
      }
      throw new Error(
        (errorDetail && (errorDetail.message || errorDetail.code || JSON.stringify(errorDetail))) ||
        'Unknown error updating profile'
      )
    }
    return { success: true }
  } catch (error: any) {
    console.error('Error updating user profile:', error)
    throw new Error(error.message)
  }
}

// Get a working proxy from user settings (no fallback)
async function getProxy(userProxies?: string[]) {
  // userProxies should be passed in from the request or user settings
  if (!userProxies || !Array.isArray(userProxies) || userProxies.length === 0) {
    throw new Error('No proxies set. Please add proxies in General/Settings before restoring your profile.')
  }
  // Return a random proxy from the user's list
  return userProxies[Math.floor(Math.random() * userProxies.length)].trim()
}

// CapSolver integration function
async function solveCaptcha(captchaData: any, solverKey: string, userProxies?: string[]) {
  try {
    // Get a proxy for the task
    const proxy = await getProxy(userProxies)
    // CapSolver expects proxy as a string: "ip:port"
    // Create task on CapSolver
    const createTaskResponse = await fetch('https://api.capsolver.com/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientKey: solverKey,
        task: {
          type: 'HCaptchaTask',
          websiteURL: 'https://discord.com',
          websiteKey: captchaData.captcha_sitekey,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9194 Chrome/134.0.6998.205 Electron/35.3.0 Safari/537.36',
          isInvisible: false,
          proxy: proxy // Pass as string
        }
      })
    })

    if (!createTaskResponse.ok) {
      throw new Error(`CapSolver API error: ${createTaskResponse.status} ${createTaskResponse.statusText}`)
    }

    const createTaskResult = await createTaskResponse.json()
    let taskId: string
    if (createTaskResult.errorId !== 0) {
      // If proxy-based task fails, try with a different proxy
      if (createTaskResult.errorDescription && createTaskResult.errorDescription.includes('proxy')) {
        console.log('Proxy failed, trying with fallback proxy...')
        const fallbackProxy = await getProxy()
        const fallbackResponse = await fetch('https://api.capsolver.com/createTask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clientKey: solverKey,
            task: {
              type: 'HCaptchaTask',
              websiteURL: 'https://discord.com',
              websiteKey: captchaData.captcha_sitekey,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9194 Chrome/134.0.6998.205 Electron/35.3.0 Safari/537.36',
              isInvisible: false,
              proxy: fallbackProxy // Pass as string
            }
          })
        })
        if (!fallbackResponse.ok) {
          throw new Error(`CapSolver API error (retry): ${fallbackResponse.status} ${fallbackResponse.statusText}`)
        }
        const fallbackResult = await fallbackResponse.json()
        if (fallbackResult.errorId !== 0) {
          throw new Error(`CapSolver create task error (after retry): ${fallbackResult.errorDescription}`)
        }
        // Use fallback task ID
        taskId = fallbackResult.taskId
      } else {
        throw new Error(`CapSolver create task error: ${createTaskResult.errorDescription}`)
      }
    } else {
      // Use original task ID
      taskId = createTaskResult.taskId
    }
    // Poll for solution
    let attempts = 0
    const maxAttempts = 60 // 2 minutes with 2-second intervals
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      const getResultResponse = await fetch('https://api.capsolver.com/getTaskResult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientKey: solverKey,
          taskId: taskId
        })
      })
      if (!getResultResponse.ok) {
        throw new Error(`CapSolver get result API error: ${getResultResponse.status} ${getResultResponse.statusText}`)
      }
      const getResultData = await getResultResponse.json()
      if (getResultData.errorId !== 0) {
        throw new Error(`CapSolver get result error: ${getResultData.errorDescription}`)
      }
      if (getResultData.status === 'ready') {
        return {
          success: true,
          captcha_key: getResultData.solution.gRecaptchaResponse
        }
      }
      if (getResultData.status === 'failed') {
        throw new Error('CapSolver failed to solve captcha')
      }
      attempts++
    }
    throw new Error('CapSolver timeout - captcha solving took too long')
  } catch (error: any) {
    console.error('CapSolver error:', error)
    // Propagate error so API handler can set correct status
    throw new Error(`CapSolver error: ${error.message}`)
  }
}
