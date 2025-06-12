"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NotificationPopup } from "@/components/notification-popup"
import { MouseCRTEffect } from "@/components/mouse-crt-effect"
import { 
  Home, 
  Settings, 
  BarChart3, 
  Star, 
  Database, 
  User, 
  Sliders, 
  Wrench, 
  Palette, 
  Bell,
  LogOut,
  Activity,
  Users,
  Server,
  Zap
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState("dashboard")
  const [userInfo, setUserInfo] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  const [settingsToken, setSettingsToken] = useState(() => {
  if (typeof window !== "undefined") {
      return localStorage.getItem("ryzor_token") || ""
    }
    return ""
  })
  
  const [settingsSolverKey, setSettingsSolverKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ryzor_solver_key") || ""
    }
    return ""
  })
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [proxyStatus, setProxyStatus] = useState<string | null>(null)
  const [proxyLoading, setProxyLoading] = useState(false)
  const [currentProxy, setCurrentProxy] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [presence, setPresence] = useState("desktop")
  const [tools, setTools] = useState({
    nitroSniper: { active: false, sniped: 47, success: 89 },    autoJoiner: { active: false, joined: 23, queue: 0 },
    serverScraper: { active: false, scraped: 15, members: 2847 },
    accountBackup: { active: false, backups: 3, size: "2.4GB" },
    tokenVault: { active: false, tokens: 8 },
    serverCloner: { active: false, cloned: 0, success: 0 }
  })
  const [stats, setStats] = useState({
    totalActiveTools: 0,
    totalServers: 1,
    totalSuccessRate: 92,
    totalOnlineUsers: 1,
    serverUsage: 67,
    recentActivity: [],
    errors: [] as Array<{timestamp: Date, error: string, source: string}>
  })
  const [scrapedData, setScrapedData] = useState<any[]>([])
  const [loadingScrapedData, setLoadingScrapedData] = useState(false)
  const [backupData, setBackupData] = useState<any[]>([])
  const [loadingBackupData, setLoadingBackupData] = useState(false)

  // Notification popup state
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm'
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  // Error tracking function
  const logError = (error: string, source: string) => {
    setStats(prev => ({
      ...prev,
      errors: [...prev.errors, { timestamp: new Date(), error, source }].slice(-50) // Keep last 50 errors
    }))
  }

  // Helper function to show notifications
  const showNotification = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info',
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setNotification({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
      confirmText,
      cancelText
    })
  }

  // Show backup limit popup if needed
  const handleBackupLimitWarning = (oldestBackup: any, onConfirm: () => void) => {
    showNotification(
      "Backup Limit Reached",
      `You can only have 3 backups. Creating a new backup will delete your oldest backup from ${new Date(oldestBackup.created_at).toLocaleString()}. Continue?`,
      'confirm',
      onConfirm,
      'Yes, delete oldest',
      'Cancel'
    )
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/signup")
        return
      }
      if (user && !user.email_confirmed_at) {
        router.replace("/verify")
        return
      }
      setCurrentUser(user)
      setLoading(false)
    })
  }, [router])  // Menu items for sidebar (moved general to bottom)
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "control", label: "Control Panel", icon: Sliders },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "ratings", label: "Ratings", icon: Star },
    { id: "backups", label: "Backups", icon: Database },
    { id: "data-storage", label: "Data Storage", icon: Server },
    { id: "account", label: "Account", icon: User },
    { id: "utility", label: "Utility", icon: Wrench },
    { id: "customization", label: "Customization", icon: Palette },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "general", label: "General", icon: Settings },
  ]
  // Enhanced sidebar with cyber aesthetic design
  const sidebar = (
    <div className="fixed left-0 top-0 min-h-screen w-64 cyber-glass-card border-r border-red-600/40 flex flex-col justify-center py-6 z-20 shadow-2xl shadow-red-500/20 backdrop-blur-xl">
      {/* Logo/Brand with cyber glow */}
      <div className="px-6 mb-8 relative flex flex-col items-center">
        <div className="relative flex flex-col items-center">
          <h1 className="text-2xl font-bold text-red-400 cyber-title glow-red-intense drop-shadow-[0_0_24px_rgba(255,0,0,0.9)] pointer-events-none select-none" style={{textShadow: '0 0 32px #ff1744, 0 0 8px #fff'}}>
            Ryzor.cc
          </h1>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-red-500 to-transparent opacity-80 rounded-full blur-sm pointer-events-none"></div>
        </div>
        <div className="mt-2 text-xs text-gray-400 font-mono">v2.1.0 • ONLINE</div>
      </div>
      
      {/* Status indicator strip */}
      <div className="px-6 mb-6">
        <div className="glass-panel p-3 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">SYSTEM ONLINE</span>
            </div>
            <div className="text-xs text-gray-400">{stats.totalActiveTools} active</div>
          </div>
          <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
            <div className="bg-gradient-to-r from-red-500 to-green-500 h-1 rounded-full transition-all duration-500" style={{width: `${stats.totalSuccessRate}%`}}></div>
          </div>
        </div>
      </div>
      
      {/* Menu Items with enhanced styling */}
      <div className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              className={`group w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-300 ease-in-out relative overflow-hidden ${
                isActive 
                  ? "bg-gradient-to-r from-red-600/80 to-red-700/60 text-white shadow-lg shadow-red-600/30 border border-red-500/50" 
                  : "text-gray-300 hover:bg-red-600/20 hover:text-red-300 hover:border hover:border-red-600/30 glass-panel"
              }`}
              onClick={() => setActivePage(item.id)}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20 animate-pulse"></div>
              )}
              <Icon size={18} className={`mr-3 relative z-10 ${isActive ? 'text-red-200' : ''} group-hover:scale-110 transition-transform duration-200`} />
              <span className="font-medium relative z-10">{item.label}</span>
              {isActive && (
                <div className="absolute right-2 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              )}
              {!isActive && (
                <div className="absolute right-2 w-1 h-4 bg-gradient-to-b from-transparent via-red-500/20 to-transparent group-hover:via-red-500/40 transition-all duration-300"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* User info section */}
      <div className="px-4 mb-4">
        <div className="glass-panel p-3 rounded-xl">
          <div className="flex items-center space-x-3">
            <img 
              src={userInfo?.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : "/placeholder-user.jpg"} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full border border-red-500/50 shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {userInfo?.username || currentUser?.email?.split('@')[0] || 'User'}
              </div>
              <div className="text-xs text-gray-400">Premium User</div>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Logout Button with enhanced styling */}
      <div className="px-4 pt-4 border-t border-red-600/30">
        <button
          className="group w-full flex items-center px-4 py-3 rounded-xl text-left text-gray-300 hover:bg-red-600/30 hover:text-red-300 transition-all duration-300 ease-in-out glass-panel hover:border hover:border-red-600/50 relative overflow-hidden"
          onClick={async () => {
            await supabase.auth.signOut()
            router.replace("/signup")
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/0 to-red-600/0 group-hover:via-red-600/10 transition-all duration-300"></div>
          <LogOut size={18} className="mr-3 relative z-10 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium relative z-10">Logout</span>
          <div className="absolute right-2 w-1 h-4 bg-gradient-to-b from-transparent via-red-500/20 to-transparent group-hover:via-red-500/40 transition-all duration-300"></div>
        </button>
      </div>
    </div>
  )

  const handleSaveToken = async () => {
    setSettingsLoading(true)
    setSettingsStatus(null)
    try {
      localStorage.setItem("ryzor_token", settingsToken)
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: settingsToken })
      })
      const data = await res.json()
      if (data.ok && data.user) {
        setUserInfo(data.user)
        setSettingsStatus("Token saved! User: " + data.user.username + "#" + data.user.discriminator)
      } else {
        setSettingsStatus("Invalid token: " + (data.error || "Unknown error"))
      }
    } catch (e: any) {
      setSettingsStatus("Error: " + e.message)
    }
    setSettingsLoading(false)
  }
  const handleSaveSolverKey = () => {
    localStorage.setItem("ryzor_solver_key", settingsSolverKey)
    setSettingsStatus("Solver key saved!")
  }

  // Proxy management functions
  const handleGetProxy = async () => {
    setProxyLoading(true)
    setProxyStatus(null)
    try {
      const response = await fetch('https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all')
      const proxyList = await response.text()
      const proxies = proxyList.trim().split('\n').filter(p => p.trim())
      
      if (proxies.length === 0) {
        setProxyStatus("No proxies available from ProxyScrape")
        return
      }
      
      const proxy = proxies[Math.floor(Math.random() * Math.min(proxies.length, 10))] // Get random from first 10
      setCurrentProxy(proxy)
      setProxyStatus(`Got proxy: ${proxy}`)
    } catch (error: any) {
      setProxyStatus(`Error fetching proxy: ${error.message}`)
    }
    setProxyLoading(false)
  }

  const handleTestProxy = async () => {
    if (!currentProxy) {
      setProxyStatus("No proxy to test")
      return
    }
    
    setProxyLoading(true)
    setProxyStatus("Testing proxy connectivity...")
    
    try {
      // Test proxy by trying to connect through it
      const [proxyHost, proxyPort] = currentProxy.split(':')
      const testResponse = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proxyHost,
          proxyPort: parseInt(proxyPort)
        })
      })
      
      const data = await testResponse.json()
      
      if (data.ok) {
        setProxyStatus(`✅ Proxy working! Response time: ${data.responseTime}ms`)
      } else {
        setProxyStatus(`❌ Proxy failed: ${data.error}`)
      }
    } catch (error: any) {
      setProxyStatus(`❌ Proxy test failed: ${error.message}`)
    }
    setProxyLoading(false)
  }

  // On mount, load token from localStorage and fetch user info if present
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("ryzor_token") : null
    if (token && !userInfo) { // Only fetch if we don't already have user info
      setSettingsToken(token)
      fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })
        .then(res => res.json())
        .then(data => {
          if (data.ok && data.user) setUserInfo(data.user)
        })        .catch(error => console.log('Token validation error:', error))
    }

    const solverKey = typeof window !== "undefined" ? localStorage.getItem("ryzor_solver_key") : null
    if (solverKey && !settingsSolverKey) {
      setSettingsSolverKey(solverKey)
    }
  }, [])

  useEffect(() => {
    const activeCount = Object.values(tools).filter(tool => tool.active).length
    setStats(prev => ({
      ...prev,
      totalActiveTools: activeCount
    }))
  }, [tools])
  useEffect(() => {
    if (!settingsToken) return

    const pollStats = async () => {
      try {
        const res = await fetch('/api/stats', {
          headers: {
            'authorization': settingsToken
          }
        })
        const data = await res.json()
        
        if (data.ok) {
          // Calculate success rate based on errors logged
          const totalErrors = stats.errors.length
          const successRate = totalErrors > 0 ? Math.max(90 - Math.floor(totalErrors / 10), 50) : 96
          
          // Update statistics with live data - (forcing users and servers to 1 for demo purposes)
          setStats(prev => ({
            ...prev,
            totalServers: 1,
            totalSuccessRate: successRate,
            totalOnlineUsers: 1,
            serverUsage: data.stats?.globalStats?.serverUsage || 67,
            recentActivity: data.stats?.globalStats?.recentActivity || []
          }))

          // Update tool statistics
          setTools(prev => {
            const updatedTools = {
              ...prev,
              nitroSniper: {
                ...prev.nitroSniper,
                sniped: data.stats?.personalStats?.nitroSniped || prev.nitroSniper.sniped,
                success: data.stats?.personalStats?.successRate || prev.nitroSniper.success
              },
              autoJoiner: {
                ...prev.autoJoiner,
                joined: data.stats?.personalStats?.serversJoined || prev.autoJoiner.joined,
                queue: data.stats?.toolStatus?.autoJoiner?.queue || prev.autoJoiner.queue
              },
              serverScraper: {
                ...prev.serverScraper,
                scraped: data.stats?.toolStatus?.serverScraper?.scraped || prev.serverScraper.scraped,
                members: data.stats?.toolStatus?.serverScraper?.members || prev.serverScraper.members
              },
              accountBackup: {
                ...prev.accountBackup,
                backups: data.stats?.personalStats?.backupsCreated || prev.accountBackup.backups,
                size: data.stats?.toolStatus?.accountBackup?.size || prev.accountBackup.size
              },
              tokenVault: {
                ...prev.tokenVault,
                tokens: data.stats?.personalStats?.tokensStored || prev.tokenVault.tokens
              }
            }
            
            // Update active tools count based on the updated tools
            const activeCount = Object.values(updatedTools).filter(tool => tool.active).length
            setStats(prevStats => ({
              ...prevStats,
              totalActiveTools: activeCount
            }))
            
            return updatedTools
          })
        }
      } catch (error) {
        console.log('Stats polling error:', error)
      }
    }

    // Poll immediately, then every 30 seconds
    pollStats()
    const interval = setInterval(pollStats, 30000)

    return () => clearInterval(interval)  }, [settingsToken]) // Removed 'tools' dependency to prevent spam
  // Load backup data when backups page is opened
  useEffect(() => {
    if (activePage === "backups" && settingsToken) {
      loadBackupData()
    }
  }, [activePage, settingsToken])

  // Add at the top of the component (inside DashboardPage)
  const [refreshIntervalId, setRefreshIntervalId] = useState<NodeJS.Timeout | null>(null)

  // Auto-refresh backups if any are running
  useEffect(() => {
    if (activePage === "backups") {
      // If any backup is running, start interval
      const hasRunning = backupData.some(b => b.status === 'running')
      if (hasRunning && !refreshIntervalId) {
        const id = setInterval(() => {
          loadBackupData()
        }, 1000)
        setRefreshIntervalId(id)
      } else if (!hasRunning && refreshIntervalId) {
        clearInterval(refreshIntervalId)
        setRefreshIntervalId(null)
      }
    } else if (refreshIntervalId) {
      clearInterval(refreshIntervalId)
      setRefreshIntervalId(null)
    }

    // Cleanup on unmount
    return () => {
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId)
      }
    }
  }, [activePage, backupData, refreshIntervalId])

  // Tool management functions
  const toggleTool = (toolName: string) => {
    setTools(prev => ({
      ...prev,
      [toolName]: {
        ...prev[toolName as keyof typeof prev],
        active: !prev[toolName as keyof typeof prev].active
      }
    }))
  }

  const handleStart = async () => {
    setIsStarting(true)
    setStatus(null)
    try {
      if (!userInfo || !settingsToken) {
        setStatus("Please set your token in settings first.")
        setIsStarting(false)
        return
      }      const res = await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: settingsToken, presence })
      })
      const data = await res.json()
      if (data.ok) {
        setStatus("Presence changed successfully!")
      } else {
        // Log server-side errors only
        if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized')) {
          logError(data.error, 'presence')
        }
        setStatus("Failed: " + (data.error || "Unknown error"))
      }
    } catch (e: any) {
      // Log network/connection errors
      logError(e.message, 'presence-network')
      setStatus("Error: " + e.message)
    }setIsStarting(false)
  }
  
  // Backup management functions
  const loadBackupData = async () => {
    if (!settingsToken) return
    
    setLoadingBackupData(true)
    try {
      const res = await fetch('/api/account-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_backups',
          token: settingsToken
        })
      })
      const data = await res.json()
      
      if (data.ok) {
        setBackupData(data.backups || [])
      }
    } catch (error) {
      console.log('Error loading backup data:', error)
    }
    setLoadingBackupData(false)
  }

  const downloadBackupData = async (backupId: string, backupType: string) => {
    if (!settingsToken) return
    
    try {
      const res = await fetch('/api/account-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'download_backup',
          token: settingsToken,
          backupId
        })
      })
      const data = await res.json()
        if (data.ok) {
        // Create downloadable blob from the backup data
        const jsonData = JSON.stringify(data.data, null, 2)
        const blob = new Blob([jsonData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `${backupType}_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.log('Error downloading backup data:', error)
    }
  }

  const deleteBackupData = async (backupId: string) => {
    if (!settingsToken) return
    
    try {
      const res = await fetch('/api/account-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_backup',
          token: settingsToken,
          backupId
        })
      })
      const data = await res.json()
      
      if (data.ok) {
        // Reload the data
        loadBackupData()
      }    } catch (error) {
      console.log('Error deleting backup data:', error)
    }
  }
  const restoreBackupData = async (backupId: string, backupType: string) => {
    if (!settingsToken) return
    
    // Show confirmation popup
    showNotification(
      'Confirm Restore',
      `Are you sure you want to restore from this ${backupType} backup? This will:\n\n• Update your Discord profile to match the backup\n• Identify servers you need to rejoin\n• Compare current settings with backup\n\nContinue with restore?`,
      'confirm',
      async () => {
        // Actual restore logic
        setStatus('Starting restore process...')
          try {
          const res = await fetch('/api/account-backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'restore_backup',
              token: settingsToken,
              backupId,
              solverKey: settingsSolverKey
            })
          })
          const data = await res.json()
          
          if (data.ok) {
            const summary = data.summary
            let message = `Restore completed!\n\nProfile updates: ${summary.profileUpdates}\nServers to rejoin: ${summary.serversToJoin}\nSettings to review: ${summary.settingsUpdates}\nTotal changes: ${summary.totalChanges}`
            
            showNotification('Restore Completed', message, 'success')
            setStatus(`Restore completed: ${summary.totalChanges} changes applied`)
            
            // Show detailed changes in console for debugging
            console.log('Restore details:', data.changes)
          } else {
            setStatus(`Restore failed: ${data.error}`)
            showNotification('Restore Failed', `Restore failed: ${data.error}`, 'error')
          }
        } catch (error) {
          console.log('Error restoring backup:', error)
          setStatus('Restore failed: Network error')
          showNotification('Restore Failed', 'Restore failed due to network error', 'error')
        }
      },
      'Restore',
      'Cancel'
    )
  }

  // Welcome section component
  const WelcomeSection = () => (
    <div className="cyber-glass-card p-6 shadow-lg shadow-black/20 mb-8 slide-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <img 
              src={userInfo?.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : "/placeholder-user.jpg"} 
              alt="User avatar" 
              className="w-12 h-12 rounded-full border-2 border-red-500 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#252525] shadow-lg animate-pulse"></div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">
              Welcome, {userInfo?.username || currentUser?.email?.split('@')[0] || 'User'}
            </h2>
            <div className="flex items-center text-sm text-gray-400">
              <span className="text-green-400 mr-2 animate-pulse">●</span>
              Online
            </div>
          </div>
        </div>
        {userInfo && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Discord ID</div>
            <div className="text-sm font-mono text-red-400 bg-black/30 px-3 py-1 rounded-xl">{userInfo.id}</div>
          </div>
        )}
      </div>
    </div>
  )  // Metrics cards
  const MetricsPanel = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Active Tools</p>
            <p className="text-3xl font-bold text-white">{stats.totalActiveTools}</p>
          </div>
          <Activity className="w-10 h-10 text-red-500 animate-pulse" />
        </div>
      </Card>
      <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Servers</p>
            <p className="text-3xl font-bold text-white">{stats.totalServers}</p>
          </div>
          <Server className="w-10 h-10 text-red-500" />
        </div>
      </Card>
      <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Success Rate</p>
            <p className="text-3xl font-bold text-white">{stats.totalSuccessRate}%</p>
          </div>
          <Zap className="w-10 h-10 text-red-500" />
        </div>
      </Card>
      <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Online Users</p>
            <p className="text-3xl font-bold text-white">{stats.totalOnlineUsers.toLocaleString()}</p>
          </div>
          <Users className="w-10 h-10 text-red-500" />
        </div>
      </Card>
    </div>
  )  // Server usage gauge component
  const ServerUsageGauge = () => {
    const usedPercentage = stats.serverUsage
    const leftPercentage = 100 - usedPercentage
    const strokeWidth = 10
    const radius = 65
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (usedPercentage / 100) * circumference

    return (
      <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
        <h3 className="text-xl font-bold text-white mb-6 text-center">Server Usage</h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="160" height="160" className="transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#404040"
                strokeWidth={strokeWidth}
                fill="none"
                className="rounded-full"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#FF0000"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out rounded-full"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-red-500">{usedPercentage}%</span>
              <span className="text-sm text-gray-400 font-medium">Used</span>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-400 glass-panel p-3 rounded-xl">
            <span className="text-red-500 font-bold">{usedPercentage}% Used</span> • <span className="text-green-500 font-bold">{leftPercentage}% Left</span>
          </div>
        </div>
      </Card>
    )
  }// Main content switching
  let mainContent
  if (activePage === "general") {
    mainContent = (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">General Settings</h1>
        <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
          <h2 className="text-2xl font-bold mb-6 text-red-400">Discord Configuration</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-3">Discord Token</label>
              <input
                type="password"
                placeholder="Your Discord Token"
                className="w-full p-4 rounded-xl bg-black/60 border border-red-500 text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                value={settingsToken}
                onChange={e => setSettingsToken(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-3">CapSolver Key</label>
              <input
                type="text"
                placeholder="Your CapSolver API Key"
                className="w-full p-4 rounded-xl bg-black/60 border border-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                value={settingsSolverKey}
                onChange={e => setSettingsSolverKey(e.target.value)}
                autoComplete="off"
              />
              <Button
                type="button"
                className="cyber-button-primary w-full py-4 rounded-xl font-bold border-none transition-all duration-300 shadow-lg mt-2"
                onClick={handleSaveSolverKey}
                disabled={!settingsSolverKey}
              >
                Save Solver Key
              </Button>
            </div>
            <Button
              type="submit"
              className="cyber-button-primary w-full py-4 rounded-xl font-bold border-none transition-all duration-300 shadow-lg"
              onClick={handleSaveToken}
              disabled={settingsLoading || !settingsToken}
            >
              {settingsLoading ? "Saving..." : "Save Token"}
            </Button>
            {settingsStatus && <div className="mt-4 p-3 rounded-xl bg-black/30 text-red-300">{settingsStatus}</div>}
              {/* Token Instructions */}
            <div className="mt-6 p-4 glass-panel rounded-xl">
              <h4 className="text-red-400 font-bold mb-3">How to get your Discord Token:</h4>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Open Discord in your browser (discord.com/app)</li>
                <li>Press <code className="bg-black/50 px-2 py-1 rounded text-red-300">F12</code> to open Developer Tools</li>
                <li>Go to the <strong className="text-white">Network</strong> tab</li>
                <li>Send any message in any channel</li>
                <li>Look for a POST request (usually named "messages")</li>
                <li>Click on it and scroll down to <strong className="text-white">Request Headers</strong></li>
                <li>Find <code className="bg-black/50 px-2 py-1 rounded text-red-300">authorization:</code> and copy the value</li>
              </ol>
              <div className="mt-3 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
                <p className="text-yellow-300 text-xs">
                  ⚠️ <strong>Warning:</strong> Never share your token with anyone. It gives full access to your Discord account.
                </p>
              </div>
            </div>
            
            {/* CapSolver Instructions */}
            <div className="mt-6 p-4 glass-panel rounded-xl">
              <h4 className="text-blue-400 font-bold mb-3">How to get your CapSolver API Key:</h4>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://www.capsolver.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">CapSolver.com</a></li>
                <li>Create an account and log in</li>
                <li>Add funds to your account (captcha solving costs ~$0.001 per solve)</li>
                <li>Go to your dashboard and copy your <strong className="text-white">API Key</strong></li>
                <li>Paste it in the CapSolver Key field above</li>
              </ol>              <div className="mt-3 p-3 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                <p className="text-blue-300 text-xs">
                  ℹ️ <strong>Info:</strong> CapSolver is required to bypass Discord's captcha protection during profile restoration. Without it, some restore operations may fail.
                </p>
              </div>
            </div>
            
            {/* Proxy Management Section */}
            <div className="mt-8 p-6 glass-panel rounded-xl border border-green-500/30">
              <h4 className="text-green-400 font-bold mb-4">Proxy Management</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    type="button"
                    className="cyber-button-primary py-3 rounded-xl font-bold border-none transition-all duration-300 shadow-lg"
                    onClick={handleGetProxy}
                    disabled={proxyLoading}
                  >
                    {proxyLoading ? "Getting Proxy..." : "Get Public Proxy"}
                  </Button>
                  <Button
                    type="button"
                    className="cyber-button py-3 rounded-xl font-bold border-none transition-all duration-300 shadow-lg"
                    onClick={handleTestProxy}
                    disabled={proxyLoading || !currentProxy}
                  >
                    {proxyLoading ? "Testing..." : "Test Proxy"}
                  </Button>
                </div>
                
                {currentProxy && (
                  <div className="p-3 bg-green-600/20 border border-green-600/50 rounded-lg">
                    <div className="text-green-300 text-sm">
                      <strong>Current Proxy:</strong> {currentProxy}
                    </div>
                  </div>
                )}
                
                {proxyStatus && (
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="text-gray-300 text-sm">{proxyStatus}</div>
                  </div>
                )}
                
                <div className="text-gray-400 text-xs">
                  <p><strong>Why proxies?</strong> CapSolver requires proxies for HCaptcha solving to avoid rate limits and improve success rates. We automatically fetch free public proxies from ProxyScrape.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )} else if (activePage === "control") {
    mainContent = (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Control Panel</h1>
        
        {/* Functional Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          
          {/* Nitro Sniper */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-400">Nitro Sniper</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${tools.nitroSniper.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                {tools.nitroSniper.active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            <div className="space-y-3">
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-sm text-gray-400">Claimed</div>
                <div className="text-xl font-bold text-green-400">{tools.nitroSniper.sniped}</div>
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-sm text-gray-400">Success Rate</div>
                <div className="text-xl font-bold text-green-400">{tools.nitroSniper.success}%</div>
              </div>
              <Button 
                className={`w-full py-2 rounded-lg transition-all duration-300 ${tools.nitroSniper.active ? 'cyber-button bg-red-600 hover:bg-red-700' : 'cyber-button-primary'}`}
                onClick={async () => {
                  if (!userInfo || !settingsToken) {
                    setStatus("Please set your Discord token in General settings first")
                    return
                  }
                  
                  setIsStarting(true)
                  try {
                    const action = tools.nitroSniper.active ? 'stop' : 'start'
                    const res = await fetch('/api/nitro-sniper', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action,
                        token: settingsToken,
                        channels: ['general', 'giveaways', 'chat'] // Default monitoring channels
                      })
                    })
                    const data = await res.json()
                      if (data.ok) {
                      toggleTool('nitroSniper')
                      setStatus(data.message)
                    } else {
                      // Log server-side errors, not user errors
                      if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized')) {
                        logError(data.error, 'nitro-sniper')
                      }
                      setStatus(`Error: ${data.error}`)
                    }
                  } catch (e: any) {
                    // Log network/connection errors
                    logError(e.message, 'nitro-sniper-network')
                    setStatus(`Error: ${e.message}`)
                  }
                  setIsStarting(false)
                }}
                disabled={isStarting}
              >
                {isStarting ? 'Processing...' : (tools.nitroSniper.active ? 'Stop Sniper' : 'Start Sniper')}
              </Button>
            </div>
          </Card>

          {/* Auto Joiner */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-400">Auto Joiner</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${tools.autoJoiner.active ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'}`}>
                {tools.autoJoiner.active ? 'ACTIVE' : 'INACTIVE'}
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="discord.gg/example"
                className="w-full p-3 rounded-lg glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                id="joiner-invite"
              />
              <div className="grid grid-cols-2 gap-2">
                <div className="glass-panel p-2 rounded-lg text-center">
                  <div className="text-xs text-gray-400">Joined</div>
                  <div className="text-lg font-bold text-red-400">{tools.autoJoiner.joined}</div>
                </div>
                <div className="glass-panel p-2 rounded-lg text-center">
                  <div className="text-xs text-gray-400">Queue</div>
                  <div className="text-lg font-bold text-yellow-400">{tools.autoJoiner.queue}</div>
                </div>
              </div>
              <Button 
                className="w-full py-2 rounded-lg cyber-button-primary"
                onClick={async () => {
                  if (!userInfo || !settingsToken) {
                    setStatus("Please set your Discord token in General settings first")
                    return
                  }

                  const inviteInput = document.getElementById('joiner-invite') as HTMLInputElement
                  const invite = inviteInput?.value.trim()
                  
                  if (!invite) {
                    setStatus("Please enter an invite link")
                    return
                  }

                  setIsStarting(true)
                  try {
                    const res = await fetch('/api/auto-joiner', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'join',
                        token: settingsToken,
                        invites: [invite]
                      })
                    })
                    const data = await res.json()
                      if (data.ok) {
                      if (data.joined) {
                        setTools(prev => ({
                          ...prev,
                          autoJoiner: {
                            ...prev.autoJoiner,
                            joined: prev.autoJoiner.joined + 1,
                            active: true
                          }
                        }))
                        setStatus(`Successfully joined: ${data.serverName || 'Server'}`)
                        inviteInput.value = ''
                      } else {
                        // Log server-side errors only
                        if (data.error && !data.error.includes('invite') && !data.error.includes('invalid') && !data.error.includes('expired')) {
                          logError(data.error, 'auto-joiner')
                        }
                        setStatus(`Failed to join: ${data.error}`)
                      }
                    } else {
                      // Log server-side errors only
                      if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized')) {
                        logError(data.error, 'auto-joiner')
                      }
                      setStatus(`Error: ${data.error}`)
                    }
                  } catch (e: any) {
                    logError(e.message, 'auto-joiner-network')
                    setStatus(`Error: ${e.message}`)
                  }
                  setIsStarting(false)
                }}
                disabled={isStarting}
              >
                {isStarting ? 'Joining...' : 'Join Server'}
              </Button>
            </div>
          </Card>

          {/* Presence Changer */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-bold mb-4 text-red-400">Presence Changer</h3>
            <div className="space-y-3">
              <select
                className="w-full p-3 rounded-lg glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                value={presence}
                onChange={e => setPresence(e.target.value)}
              >
                <option value="desktop">🖥️ Desktop</option>
                <option value="web">🌐 Web</option>
                <option value="mobile">📱 Mobile</option>
                <option value="console">🎮 Console</option>
              </select>
              <input
                type="text"
                placeholder="Custom status..."
                className="w-full p-3 rounded-lg glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                value={status || ''}
                onChange={e => setStatus(e.target.value)}
              />
              <Button
                className="w-full py-2 rounded-lg cyber-button-primary"
                onClick={handleStart}
                disabled={isStarting || !userInfo}
              >
                {isStarting ? "Updating..." : "Update Presence"}
              </Button>
            </div>
          </Card>          {/* Server Scraper */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-bold mb-4 text-red-400">Server Scraper</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Server ID or invite link"
                className="w-full p-3 rounded-lg glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400"
                id="scraper-input"
              />              <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                <span className="text-white text-sm">Include Messages</span>
                <input 
                  type="checkbox" 
                  id="include-messages"
                  className="cyber-checkbox"
                />
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-sm text-gray-400">Last Scraped</div>
                <div className="text-sm text-white">{tools.serverScraper.members.toLocaleString()} members</div>
              </div>
              <Button 
                className="w-full py-2 rounded-lg cyber-button-primary"
                onClick={async () => {
                  if (!userInfo || !settingsToken) {
                    setStatus("Please set your Discord token in General settings first")
                    return
                  }

                  const scraperInput = document.getElementById('scraper-input') as HTMLInputElement
                  const includeMessagesCheckbox = document.getElementById('include-messages') as HTMLInputElement
                  const input = scraperInput?.value.trim()
                  const includeMessages = includeMessagesCheckbox?.checked || false
                  
                  if (!input) {
                    setStatus("Please enter a server ID or invite link")
                    return
                  }

                  setIsStarting(true)
                  try {
                    const isInvite = input.includes('discord.gg') || input.includes('discord.com/invite')
                    
                    const res = await fetch('/api/server-scraper', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'scrape',
                        token: settingsToken,
                        includeMessages,
                        ...(isInvite ? { inviteLink: input } : { serverId: input })
                      })
                    })
                    const data = await res.json()
                      if (data.ok) {
                      setTools(prev => ({
                        ...prev,
                        serverScraper: {
                          ...prev.serverScraper,
                          scraped: prev.serverScraper.scraped + 1,
                          members: data.data?.stats?.total_members || 0,
                          active: true
                        }
                      }))
                      setStatus(`Successfully scraped: ${data.data?.guild?.name || 'Server'}${includeMessages ? ' (including messages)' : ''}`)
                      scraperInput.value = ''
                      includeMessagesCheckbox.checked = false
                    } else {
                      // Log server-side errors only
                      if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized') && !data.error?.includes('invite')) {
                        logError(data.error, 'server-scraper')
                      }
                      setStatus(`Error: ${data.error}`)
                    }
                  } catch (e: any) {
                    logError(e.message, 'server-scraper-network')
                    setStatus(`Error: ${e.message}`)
                  }
                  setIsStarting(false)
                }}
                disabled={isStarting}
              >
                {isStarting ? 'Scraping...' : 'Scrape Server'}
              </Button>
            </div>
          </Card>

          {/* Tool Status Overview */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-bold mb-4 text-red-400">Quick Status</h3>
            <div className="space-y-2">
              {Object.entries(tools).slice(0, 4).map(([key, tool]) => (
                <div key={key} className="flex items-center justify-between p-2 glass-panel rounded-lg">
                  <span className="text-white text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className={`w-3 h-3 rounded-full ${tool.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                </div>
              ))}
            </div>
            <div className="mt-4 glass-panel p-3 rounded-lg">
              <div className="text-xs text-gray-400">Total Active Tools</div>
              <div className="text-2xl font-bold text-red-400">{stats.totalActiveTools}</div>
            </div>
          </Card>

          {/* Account Backup Quick Access */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-bold mb-4 text-red-400">Account Backup</h3>
            <div className="space-y-3">
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-sm text-gray-400">Last Backup</div>
                <div className="text-sm text-white">{tools.accountBackup.size}</div>
              </div>              <Button 
                className="w-full py-2 rounded-lg cyber-button-primary"
                onClick={async () => {
                  if (!userInfo || !settingsToken) {
                    setStatus("Please set your Discord token in General settings first")
                    return
                  }

                  setIsStarting(true)
                  try {
                    const res = await fetch('/api/account-backup', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'start_backup',
                        token: settingsToken,
                        backupType: 'full'
                      })
                    })
                    const data = await res.json()
                      if (data.ok) {
                      setStatus(`Full backup started: ${data.message}`)
                      setTools(prev => ({
                        ...prev,
                        accountBackup: { 
                          ...prev.accountBackup, 
                          active: true,
                          backups: prev.accountBackup.backups + 1
                        }
                      }))
                    } else {
                      // Log server-side errors only
                      if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized')) {
                        logError(data.error, 'account-backup')
                      }
                      setStatus(`Error: ${data.error}`)
                    }
                  } catch (e: any) {
                    logError(e.message, 'account-backup-network')
                    setStatus(`Error: ${e.message}`)
                  }
                  setIsStarting(false)
                }}
                disabled={isStarting}
              >
                {isStarting ? 'Starting...' : 'Start Full Backup'}
              </Button>
              <Button 
                className="w-full py-2 rounded-lg cyber-button"
                onClick={() => setActivePage('backups')}
              >
                View Backups
              </Button>
            </div>
          </Card>
        </div>

        {/* Status Display */}
        {status && (
          <Card className="cyber-glass-card p-4 mt-8 shadow-lg shadow-black/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">{status}</span>
            </div>
          </Card>
        )}
        
        {!userInfo && (
          <Card className="cyber-glass-card p-4 mt-8 shadow-lg shadow-black/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-yellow-400 font-medium">Please set your Discord token in General settings to use these tools</span>
            </div>
          </Card>
        )}
      </div>
    )
  } else if (activePage === "statistics") {
    mainContent = (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Statistics</h1>
        
        {/* Statistics Overview */}
        <MetricsPanel />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">          {/* Detailed Tool Stats */}
          <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-bold mb-6 text-red-400">Tool Performance</h3>
            <div className="space-y-4">
              <div className="p-4 glass-panel rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Nitro Sniper</span>
                  <span className="text-green-400">{tools.nitroSniper.sniped} claimed</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{width: `${tools.nitroSniper.success}%`}}></div>
                </div>
                <span className="text-xs text-gray-400">{tools.nitroSniper.success}% success rate</span>
              </div>
              
              <div className="p-4 glass-panel rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Auto Joiner</span>
                  <span className="text-red-400">{tools.autoJoiner.joined} joined</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{width: "85%"}}></div>
                </div>
                <span className="text-xs text-gray-400">85% success rate</span>
              </div>

              <div className="p-4 glass-panel rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Server Scraper</span>
                  <span className="text-purple-400">{tools.serverScraper.members} members</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-500" style={{width: "92%"}}></div>
                </div>
                <span className="text-xs text-gray-400">92% completion rate</span>
              </div>
            </div>
          </Card>{/* Usage Chart */}
          <ServerUsageGauge />
        </div>
      </div>
    )  } else if (activePage === "backups") {
    mainContent = (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Account Backups</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-bold mb-6 text-red-400">Backup Manager</h3>
            <div className="space-y-4">
              <div className="p-4 glass-panel rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-white">Full Account Backup</span>
                  <Button
                    className="cyber-button-primary px-4 py-2 rounded-lg text-sm"
                    onClick={async () => {
                      if (!userInfo || !settingsToken) {
                        setStatus("Please set your Discord token in General settings first")
                        return
                      }

                      setIsStarting(true)
                      try {
                        const res = await fetch('/api/account-backup', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'start_backup',
                            token: settingsToken,
                            backupType: 'full'
                          })
                        })
                        const data = await res.json()
                          if (data.ok) {
                          setTools(prev => ({
                            ...prev,
                            accountBackup: {
                              ...prev.accountBackup,
                              backups: prev.accountBackup.backups + 1,
                              active: true
                            }
                          }))
                          setStatus(`Full backup started: ${data.message}`)
                          
                          // Start polling backups every second until completion
                          const pollInterval = setInterval(async () => {
                            await loadBackupData()
                            
                            // Check if any backup is still running
                            const hasRunning = backupData.some(b => b.status === 'running')
                            if (!hasRunning) {
                              clearInterval(pollInterval)
                            }
                          }, 1000)
                        } else {
                          // Log server-side errors only
                          if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized')) {
                            logError(data.error, 'account-backup')
                          }
                          setStatus(`Error: ${data.error}`)
                        }
                      } catch (e: any) {
                        logError(e.message, 'account-backup-network')
                        setStatus(`Error: ${e.message}`)
                      }
                      setIsStarting(false)
                    }}
                    disabled={isStarting}
                  >
                    {isStarting ? 'Starting...' : 'Start Backup'}
                  </Button>
                </div>
                <p className="text-gray-400 text-sm mt-2">Includes: Servers, Stickers, Settings</p>
              </div>
            </div>
          </Card>
            <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-red-400">Recent Backups</h3>
              <Button 
                className="cyber-button-primary"
                onClick={loadBackupData}
                disabled={loadingBackupData}
              >
                {loadingBackupData ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
            
            {loadingBackupData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mr-4"></div>
                <span className="text-gray-400">Loading backups...</span>
              </div>
            ) : backupData.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-bold mb-2">No Backups Found</h3>
                  <p>You haven't created any backups yet. Use the Backup Manager to get started.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {backupData.map((backup) => (
                  <div key={backup.id} className="p-3 glass-panel rounded-xl flex justify-between items-center transition-all duration-300 hover:bg-black/40">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-white text-sm font-medium">{backup.type.charAt(0).toUpperCase() + backup.type.slice(1)} Backup</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          backup.status === 'completed' ? 'bg-green-600 text-white' :
                          backup.status === 'running' ? 'bg-yellow-600 text-white' :
                          backup.status === 'failed' ? 'bg-red-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {backup.status.toUpperCase()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-gray-400 text-xs">{backup.size}</p>
                        <p className="text-gray-400 text-xs">{new Date(backup.created).toLocaleDateString()}</p>
                        {backup.status === 'running' && (
                          <p className="text-red-400 text-xs">{backup.progress}% complete</p>
                        )}
                      </div>
                    </div>                    <div className="flex space-x-2">
                      {backup.status === 'completed' && (
                        <>
                          <Button 
                            className="cyber-button-primary px-3 py-1 rounded-lg text-xs"
                            onClick={() => downloadBackupData(backup.id, backup.type)}
                          >
                            Download
                          </Button>
                          <Button 
                            className="cyber-button px-3 py-1 rounded-lg text-xs bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30"
                            onClick={() => restoreBackupData(backup.id, backup.type)}
                          >
                            Restore
                          </Button>
                        </>
                      )}
                      <Button 
                        className="cyber-button px-3 py-1 rounded-lg text-xs bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30"
                        onClick={() => {
                          showNotification(
                            'Delete Backup',
                            `Are you sure you want to delete this ${backup.type} backup? This action cannot be undone.`,
                            'confirm',
                            () => deleteBackupData(backup.id),
                            'Delete',
                            'Cancel'
                          )
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  } else if (activePage === "data-storage") {
    // Load scraped data when page opens
    useEffect(() => {
      if (activePage === "data-storage" && settingsToken) {
        loadScrapedData()
      }
    }, [activePage, settingsToken])

    const loadScrapedData = async () => {
      if (!settingsToken) return
      
      setLoadingScrapedData(true)
      try {
        const res = await fetch('/api/server-scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'list_scrapes',
            token: settingsToken
          })
        })
        const data = await res.json()
        
        if (data.ok) {
          setScrapedData(data.scrapes || [])
        }
      } catch (error) {
        console.log('Error loading scraped data:', error)
      }
      setLoadingScrapedData(false)
    }

    const downloadScrapeData = async (scrapeId: string, serverName: string) => {
      if (!settingsToken) return
      
      try {
        const res = await fetch('/api/server-scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_scrape',
            token: settingsToken,
            scrapeId
          })
        })
        const data = await res.json()
        
        if (data.ok) {
          // Convert to JSON and download
          const jsonData = JSON.stringify(data.scrape.data, null, 2)
          const blob = new Blob([jsonData], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${serverName.replace(/[^a-zA-Z0-9]/g, '_')}_scrape_${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.log('Error downloading scrape data:', error)
      }
    }

    const deleteScrapeData = async (scrapeId: string) => {
      if (!settingsToken) return
      
      try {
        const res = await fetch('/api/server-scraper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_scrape',
            token: settingsToken,
            scrapeId
          })
        })
        const data = await res.json()
        
        if (data.ok) {
          // Reload the data
          loadScrapedData()
        }
      } catch (error) {
        console.log('Error deleting scrape data:', error)
      }    }

    mainContent = (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Data Storage</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-400">
            All your scraped server data is stored here. Download as JSON or delete when no longer needed.
          </p>
          <Button 
            className="cyber-button-primary"
            onClick={loadScrapedData}
            disabled={loadingScrapedData}
          >
            {loadingScrapedData ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {loadingScrapedData ? (
          <Card className="cyber-glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading scraped data...</p>
          </Card>
        ) : scrapedData.length === 0 ? (
          <Card className="cyber-glass-card p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Server className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold mb-2">No Scraped Data</h3>
              <p>You haven't scraped any servers yet. Use the Server Scraper tool to get started.</p>
            </div>
            <Button 
              className="cyber-button-primary mt-4"
              onClick={() => setActivePage('control')}
            >
              Go to Control Panel
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {scrapedData.map((scrape, index) => (
              <Card key={scrape.id} className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{scrape.serverName}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="glass-panel p-3 rounded-lg">
                        <div className="text-gray-400">Server ID</div>
                        <div className="text-white font-mono text-xs">{scrape.serverId}</div>
                      </div>
                      <div className="glass-panel p-3 rounded-lg">
                        <div className="text-gray-400">Scraped By</div>
                        <div className="text-white">{scrape.scrapedBy}</div>
                      </div>
                      <div className="glass-panel p-3 rounded-lg">
                        <div className="text-gray-400">Date</div>
                        <div className="text-white">{new Date(scrape.scrapedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="glass-panel p-3 rounded-lg">
                        <div className="text-gray-400">Messages</div>
                        <div className="text-white">{scrape.includeMessages ? 'Included' : 'Not included'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      className="cyber-button-primary px-4 py-2 text-sm"
                      onClick={() => downloadScrapeData(scrape.id, scrape.serverName)}
                    >
                      Download JSON
                    </Button>
                    <Button 
                      className="cyber-button px-4 py-2 text-sm bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30"
                      onClick={() => {
                        showNotification(
                          `Delete Scrape Data`,
                          `Are you sure you want to delete the scrape data for "${scrape.serverName}"?`,
                          'confirm',
                          () => deleteScrapeData(scrape.id),
                          'Delete',
                          'Cancel'
                        )
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  <div className="glass-panel p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-red-400">{scrape.stats?.total_channels || 0}</div>
                    <div className="text-xs text-gray-400">Channels</div>
                  </div>
                  <div className="glass-panel p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-400">{scrape.stats?.total_roles || 0}</div>
                    <div className="text-xs text-gray-400">Roles</div>
                  </div>
                  <div className="glass-panel p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-400">{scrape.stats?.total_emojis || 0}</div>
                    <div className="text-xs text-gray-400">Emojis</div>
                  </div>
                  <div className="glass-panel p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-yellow-400">{scrape.stats?.scraped_members || 0}</div>
                    <div className="text-xs text-gray-400">Members</div>
                  </div>
                  <div className="glass-panel p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-red-400">{scrape.stats?.total_messages || 0}</div>
                    <div className="text-xs text-gray-400">Messages</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  } else if (activePage === "utility") {
    mainContent = (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Utility Tools</h1>        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">          {/* Server Scraper */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-bold mb-4 text-red-400">Server Scraper</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Server ID or Invite Link"
                className="w-full p-3 rounded-xl glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                id="utility-scraper-input"
              />              <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                <span className="text-white text-sm">Include Messages</span>
                <input 
                  type="checkbox" 
                  id="utility-include-messages"
                  className="cyber-checkbox"
                />
              </div>
              <div className="glass-panel p-3 rounded-lg">
                <div className="text-sm text-gray-400">Last Scraped</div>
                <div className="text-sm text-white">{tools.serverScraper.members.toLocaleString()} members</div>
              </div>
              <Button 
                className="cyber-button-primary w-full py-3 rounded-xl"
                onClick={async () => {
                  if (!userInfo || !settingsToken) {
                    setStatus("Please set your Discord token in General settings first")
                    return
                  }                  const scraperInput = document.getElementById('utility-scraper-input') as HTMLInputElement
                  const includeMessagesCheckbox = document.getElementById('utility-include-messages') as HTMLInputElement
                  const input = scraperInput?.value.trim()
                  const includeMessages = includeMessagesCheckbox?.checked || false
                  
                  if (!input) {
                    setStatus("Please enter a server ID or invite link")
                    return
                  }

                  setIsStarting(true)
                  try {
                    const isInvite = input.includes('discord.gg') || input.includes('discord.com/invite')
                    
                    const res = await fetch('/api/server-scraper', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'scrape',
                        token: settingsToken,
                        includeMessages,
                        ...(isInvite ? { inviteLink: input } : { serverId: input })
                      })
                    })
                    const data = await res.json()
                      if (data.ok) {
                      setTools(prev => ({
                        ...prev,
                        serverScraper: {
                          ...prev.serverScraper,
                          scraped: prev.serverScraper.scraped + 1,
                          members: data.data?.stats?.total_members || 0,
                          active: true
                        }
                      }))
                      setStatus(`Successfully scraped: ${data.data?.guild?.name || 'Server'}${includeMessages ? ' (including messages)' : ''} - ${data.data?.stats?.total_channels} channels, ${data.data?.stats?.total_roles} roles, ${data.data?.stats?.total_members} members`)
                      scraperInput.value = ''
                      includeMessagesCheckbox.checked = false
                    } else {
                      // Log server-side errors only
                      if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized') && !data.error?.includes('invite')) {
                        logError(data.error, 'server-scraper')
                      }
                      setStatus(`Error: ${data.error}`)
                    }
                  } catch (e: any) {
                    logError(e.message, 'server-scraper-network')
                    setStatus(`Error: ${e.message}`)
                  }
                  setIsStarting(false)
                }}
                disabled={isStarting}
              >
                {isStarting ? 'Scraping...' : 'Scrape Server'}
              </Button>
              <p className="text-gray-400 text-sm">Extract member lists, channels, roles, and messages</p>
            </div>
          </Card>{/* Server Cloner */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-bold mb-4 text-red-400">Server Cloner</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Source Server ID"
                className="w-full p-3 rounded-xl glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                id="source-server-id"
              />
              <input 
                type="text" 
                placeholder="Target Server ID"
                className="w-full p-3 rounded-xl glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                id="target-server-id"
                           />
              <Button 
                className="cyber-button-primary w-full py-3 rounded-xl"
                onClick={async () => {
                  if (!userInfo || !settingsToken) {
                    setStatus("Please set your Discord token in General settings first")
                    return
                  }

                  const sourceInput = document.getElementById('source-server-id') as HTMLInputElement
                  const targetInput = document.getElementById('target-server-id') as HTMLInputElement
                  const sourceId = sourceInput?.value.trim()
                  const targetId = targetInput?.value.trim()
                  
                  if (!sourceId || !targetId) {
                    setStatus("Please enter both source and target server IDs")
                    return
                  }

                  setIsStarting(true)
                  try {
                    const res = await fetch('/api/server-cloner', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'start_clone',
                        token: settingsToken,
                        sourceServerId: sourceId,
                        targetServerId: targetId,
                        options: {
                          cloneRoles: true,
                          cloneChannels: true,
                          cloneEmojis: true,
                          setPermissions: true
                        }
                      })
                    })
                    const data = await res.json()
                      if (data.ok) {
                      setTools(prev => ({
                        ...prev,
                        serverCloner: {
                          ...prev.serverCloner,
                          cloned: prev.serverCloner.cloned + 1,
                          active: true
                        }
                      }))
                      setStatus(`Cloning started: ${data.message}`)
                      sourceInput.value = ''
                      targetInput.value = ''
                    } else {
                      // Log server-side errors only
                      if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized') && !data.error?.includes('server')) {
                        logError(data.error, 'server-cloner')
                      }
                      setStatus(`Error: ${data.error}`)
                    }
                  } catch (e: any) {
                    logError(e.message, 'server-cloner-network')
                    setStatus(`Error: ${e.message}`)
                  }
                  setIsStarting(false)
                }}
                disabled={isStarting}
              >
                {isStarting ? 'Starting Clone...' : 'Clone Server'}
              </Button>
            </div>
          </Card>          {/* Token Vault */}
          <Card className="cyber-glass-card p-6 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-bold mb-4 text-red-400">Token Vault</h3>
            <div className="space-y-4">
              <div className="p-3 glass-panel rounded-xl">
                <span className="text-white text-sm">Stored Tokens: {tools.tokenVault.tokens}</span>
              </div>
              <input 
                type="text" 
                placeholder="Token Name"
                className="w-full p-3 rounded-xl glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                id="token-name"
              />
              <input 
                type="password" 
                placeholder="Discord Token"
                className="w-full p-3 rounded-xl glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                id="new-token"
              />
              <Button 
                className="cyber-button-primary w-full py-3 rounded-xl"
                onClick={async () => {
                  if (!userInfo || !settingsToken) {
                    setStatus("Please set your Discord token in General settings first")
                    return
                  }

                  const nameInput = document.getElementById('token-name') as HTMLInputElement
                  const tokenInput = document.getElementById('new-token') as HTMLInputElement
                  const tokenName = nameInput?.value.trim()
                  const newToken = tokenInput?.value.trim()
                  
                  if (!tokenName || !newToken) {
                    setStatus("Please enter both token name and token")
                    return
                  }

                  setIsStarting(true)
                  try {
                    // First, check if vault exists and create if needed
                    const vaultRes = await fetch('/api/token-vault', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'create_vault',
                        userToken: settingsToken,
                        masterPassword: 'default123' // In production, prompt user
                      })
                    })

                    // Then add the token
                    const res = await fetch('/api/token-vault', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        action: 'add_token',
                        userToken: settingsToken,
                        tokenData: {
                          name: tokenName,
                          token: newToken
                        }
                      })
                    })
                    const data = await res.json()
                      if (data.ok) {
                      setTools(prev => ({
                        ...prev,
                        tokenVault: {
                          ...prev.tokenVault,
                          tokens: prev.tokenVault.tokens + 1,
                          active: true
                        }
                      }))
                      setStatus(`Token added successfully: ${data.message || 'Token stored securely'}`)
                      nameInput.value = ''
                      tokenInput.value = ''
                    } else {
                      // Log server-side errors only
                      if (!data.error?.includes('token') && !data.error?.includes('invalid') && !data.error?.includes('unauthorized')) {
                        logError(data.error, 'token-vault')
                      }
                      setStatus(`Error: ${data.error}`)
                    }
                  } catch (e: any) {
                    logError(e.message, 'token-vault-network')
                    setStatus(`Error: ${e.message}`)
                  }
                  setIsStarting(false)
                }}
                disabled={isStarting}
              >
                {isStarting ? 'Adding Token...' : 'Add Token'}
              </Button>
              <p className="text-gray-400 text-sm">AES-256 encrypted storage</p>
            </div>
          </Card>
        </div>
      </div>
    )
  } else if (activePage === "ratings") {
    mainContent = (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">User Ratings</h1>        <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-4">
              {[1,2,3,4,5].map(star => (
                <button key={star} className="text-yellow-400 text-3xl hover:text-yellow-300 transition-colors duration-300 hover:scale-110">★</button>
              ))}
            </div>
            <h3 className="text-xl text-white mb-2">Rate Ryzor.cc</h3>
            <p className="text-gray-400">Your feedback helps us improve</p>
          </div>
          
          <div className="space-y-4">
            <textarea 
              placeholder="Leave your feedback..."
              className="w-full p-4 rounded-xl glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400 h-32 resize-none transition-all duration-300"
            />
            <Button className="cyber-button-primary w-full py-3 rounded-xl">
              Submit Rating
            </Button>
          </div>
        </Card>
      </div>
    )
  } else if (activePage === "account") {
    mainContent = (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Account Settings</h1>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-bold mb-6 text-red-400">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <img 
                  src={userInfo?.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : "/placeholder-user.jpg"} 
                  alt="Avatar" 
                  className="w-16 h-16 rounded-full border-2 border-red-500 shadow-lg"
                />
                <div>
                  <h4 className="text-white font-medium">{userInfo?.username || currentUser?.email?.split('@')[0] || 'User'}</h4>
                  <p className="text-gray-400 text-sm">{currentUser?.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Display Name</label>
                <input 
                  type="text" 
                  defaultValue={userInfo?.username || 'User'}
                  className="w-full p-3 rounded-xl glass-panel text-white focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-300"
                />
              </div>
              
              <Button className="cyber-button-primary w-full py-3 rounded-xl">
                Update Profile
              </Button>
            </div>
          </Card>
          
          <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
            <h3 className="text-xl font-bold mb-6 text-red-400">Security</h3>
            <div className="space-y-4">
              <Button className="w-full cyber-button py-3 rounded-xl bg-yellow-600/20 border-yellow-600 text-yellow-400 hover:bg-yellow-600/30">
                               Change Password
              </Button>
              <Button className="w-full cyber-button py-3 rounded-xl bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30">
                Enable 2FA
              </Button>
              <Button className="w-full cyber-button py-3 rounded-xl bg-red-600/20 border-red-600 text-red-400 hover:bg-red-600/30">
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  } else if (activePage === "customization") {
    mainContent = (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Customization</h1>        <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
          <h3 className="text-xl font-bold mb-6 text-red-400">Theme Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {['Red', 'Blue', 'Green', 'Purple'].map(color => (
              <button key={color} className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${color === 'Red' ? 'border-red-500 glass-panel-intense' : 'border-gray-600 glass-panel hover:border-red-400'}`}>
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 shadow-lg ${color === 'Red' ? 'bg-red-500' : color === 'Blue' ? 'bg-blue-500' : color === 'Green' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                <span className="text-white text-sm">{color}</span>
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 glass-panel rounded-xl transition-all duration-300 hover:bg-black/40">
              <span className="text-white">Dark Mode</span>
              <button className="w-12 h-6 bg-red-600 rounded-full relative shadow-lg">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all duration-300 shadow-lg"></div>
              </button>
            </div>
            <div className="flex items-center justify-between p-4 glass-panel rounded-xl transition-all duration-300 hover:bg-black/40">
              <span className="text-white">Animations</span>
              <button className="w-12 h-6 bg-red-600 rounded-full relative shadow-lg">
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all duration-300 shadow-lg"></div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  } else if (activePage === "notifications") {
    mainContent = (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Notifications</h1>        <Card className="cyber-glass-card p-8 shadow-lg shadow-black/20 transition-all duration-300 hover:scale-105">
          <h3 className="text-xl font-bold mb-6 text-red-400">Notification Settings</h3>
          <div className="space-y-6">
            {[
              'Nitro Sniper Alerts',
              'Server Join Notifications', 
              'Backup Completion',
              'System Updates',
              'Security Alerts'
            ].map(notification => (
              <div key={notification} className="flex items-center justify-between p-4 glass-panel rounded-xl transition-all duration-300 hover:bg-black/40">
                <span className="text-white">{notification}</span>
                <button className="w-12 h-6 bg-red-600 rounded-full relative shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-all duration-300 shadow-lg"></div>
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  } else {
    // Dashboard main page
    mainContent = (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 cyber-title slide-in-up">Dashboard</h1>
        
        {/* Welcome Section */}
        <WelcomeSection />
        
        {/* Metrics Panel */}
        <MetricsPanel />
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">          {/* Left column - Tools */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="cyber-glass-card p-6 shadow-lg transition-all duration-300 hover:scale-105">
              <h3 className="text-xl font-bold text-red-400 mb-4">Active Tools</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass-panel rounded-lg transition-all duration-300 hover:bg-black/40">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-white">Nitro Sniper</span>
                  </div>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 glass-panel rounded-lg transition-all duration-300 hover:bg-black/40">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-white">Auto Joiner</span>
                  </div>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 glass-panel rounded-lg transition-all duration-300 hover:bg-black/40">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-white">Presence Spoofer</span>
                  </div>
                  <span className="text-red-400 text-sm">Inactive</span>
                </div>
              </div>
            </Card>

            <Card className="cyber-glass-card p-6 shadow-lg transition-all duration-300 hover:scale-105">
              <h3 className="text-xl font-bold text-red-400 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm p-2 glass-panel rounded-lg transition-all duration-300 hover:bg-black/40">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-300">Nitro claimed in 0.29s</span>
                  <span className="text-gray-500 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center text-sm p-2 glass-panel rounded-lg transition-all duration-300 hover:bg-black/40">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Joined server: Gaming Hub</span>
                  <span className="text-gray-500 ml-auto">5 min ago</span>
                </div>
                <div className="flex items-center text-sm p-2 glass-panel rounded-lg transition-all duration-300 hover:bg-black/40">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-300">Backup completed: 2.3GB</span>
                  <span className="text-gray-500 ml-auto">12 min ago</span>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right column - Server Usage Gauge */}
          <div>
            <ServerUsageGauge />
          </div>
        </div>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-white">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <span className="text-xl text-red-400">Loading Dashboard...</span>
        </div>
      </div>
    )
  }  return (
    <div className="min-h-screen text-white overflow-x-hidden spotlight-container flex">
      <MouseCRTEffect />
      <div className="cyber-background">
        <div className="animated-grid parallax-slow" />
        <div className="digital-fog parallax-medium">
          <div className="fog-layer-1" />
          <div className="fog-layer-2" />
          <div className="fog-layer-3" />
        </div>
        <div className="scanlines-overlay" />
        <div className="digital-noise-overlay" />
        <div className="crt-glow" />
      </div>
      {sidebar}
      <div className="flex-1 ml-64 overflow-y-auto" style={{scrollbarGutter:'stable'}}>
        <section className="relative min-h-screen p-8 mobile-container-padding">
          <div className="relative z-10">
            {mainContent}
          </div>
        </section>
      </div>
      {/* Notification Popup rendered globally */}
      <NotificationPopup
        isOpen={notification.isOpen}
        onClose={() => setNotification(n => ({ ...n, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onConfirm={notification.onConfirm}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
    </div>
  )
}

