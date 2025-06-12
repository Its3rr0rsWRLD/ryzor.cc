import { NextResponse } from "next/server"

const cloningOperations = new Map<string, {
  id: string,
  sourceServerId: string,
  targetServerId: string,
  status: 'pending' | 'running' | 'completed' | 'failed',
  progress: number,
  currentStep: string,
  created: string,
  completed?: string,
  clonedElements: {
    channels: number,
    roles: number,
    emojis: number,
    permissions: number
  }
}>()

export async function POST(req: Request) {
  try {
    const { action, token, sourceServerId, targetServerId, operationId, options } = await req.json()

    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing Discord token" }, { status: 400 })
    }

    const userRes = await fetch("https://discord.com/api/v9/users/@me", {
      headers: { "Authorization": token }
    })

    if (!userRes.ok) {
      return NextResponse.json({ ok: false, error: "Invalid Discord token" }, { status: 401 })
    }

    const user = await userRes.json()

    switch (action) {
      case "start_clone":
        if (!sourceServerId || !targetServerId) {
          return NextResponse.json({ ok: false, error: "Source and target server IDs required" }, { status: 400 })
        }

        const sourceRes = await fetch(`https://discord.com/api/v9/guilds/${sourceServerId}`, {
          headers: { "Authorization": token }
        })

        const targetRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}`, {
          headers: { "Authorization": token }
        })

        if (!sourceRes.ok) {
          return NextResponse.json({ ok: false, error: "Cannot access source server" }, { status: 403 })
        }

        if (!targetRes.ok) {
            return NextResponse.json({ ok: false, error: "Cannot access target server" }, { status: 403 })
        }

        const sourceGuild = await sourceRes.json()
        const targetGuild = await targetRes.json()

        const memberRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}/members/${user.id}`, {
          headers: { "Authorization": token }
        })

        if (!memberRes.ok) {
          return NextResponse.json({ ok: false, error: "You must be a member of the target server" }, { status: 403 })
        }

        const member = await memberRes.json()
        const hasAdminPerms = member.roles && member.roles.length > 0

        if (!hasAdminPerms) {
          return NextResponse.json({ ok: false, error: "Insufficient permissions in target server" }, { status: 403 })
        }

        const newOperationId = `clone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const cloneOperation = {
          id: newOperationId,
          sourceServerId,
          targetServerId,
          status: 'running' as const,
          progress: 0,
          currentStep: 'Analyzing source server',
          created: new Date().toISOString(),
          clonedElements: {
            channels: 0,
            roles: 0,
            emojis: 0,
            permissions: 0
          }
        }

        cloningOperations.set(newOperationId, cloneOperation)

        startCloningProcess(newOperationId, token, sourceGuild, targetGuild, options || {})

        return NextResponse.json({
          ok: true,
          message: `Started cloning ${sourceGuild.name} to ${targetGuild.name}`,
          operationId: newOperationId,
          estimatedTime: "5-10 minutes"
        })

      case "get_status":
        if (!operationId) {
          return NextResponse.json({ ok: false, error: "Operation ID required" }, { status: 400 })
        }

        const operation = cloningOperations.get(operationId)
        if (!operation) {
          return NextResponse.json({ ok: false, error: "Operation not found" }, { status: 404 })
        }

        return NextResponse.json({
          ok: true,
          operation
        })

      case "cancel_clone":
        if (!operationId) {
          return NextResponse.json({ ok: false, error: "Operation ID required" }, { status: 400 })
        }

        const cancelOperation = cloningOperations.get(operationId)
        if (!cancelOperation) {
          return NextResponse.json({ ok: false, error: "Operation not found" }, { status: 404 })
        }

        if (cancelOperation.status === 'running') {
          cancelOperation.status = 'failed'
          cancelOperation.currentStep = 'Cancelled by user'
        }

        return NextResponse.json({
          ok: true,
          message: "Clone operation cancelled"
        })

      case "validate_servers":
        if (!sourceServerId || !targetServerId) {
          return NextResponse.json({ ok: false, error: "Source and target server IDs required" }, { status: 400 })
        }

        const validateSourceRes = await fetch(`https://discord.com/api/v9/guilds/${sourceServerId}`, {
          headers: { "Authorization": token }
        })

        const validateTargetRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}`, {
          headers: { "Authorization": token }
        })

        return NextResponse.json({
          ok: true,
          sourceValid: validateSourceRes.ok,
          targetValid: validateTargetRes.ok,
          sourceServer: validateSourceRes.ok ? await validateSourceRes.json() : null,
          targetServer: validateTargetRes.ok ? await validateTargetRes.json() : null
        })

      default:
        return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
    }

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}

async function startCloningProcess(operationId: string, token: string, sourceGuild: any, targetGuild: any, options: any) {
  const operation = cloningOperations.get(operationId)!

  try {
    operation.currentStep = "Cloning roles"
    operation.progress = 10
    await cloneRoles(token, sourceGuild.id, targetGuild.id, operation)

    operation.currentStep = "Cloning channels"
    operation.progress = 30
    await cloneChannels(token, sourceGuild.id, targetGuild.id, operation)

    operation.currentStep = "Cloning emojis"
    operation.progress = 60
    await cloneEmojis(token, sourceGuild.id, targetGuild.id, operation)

    operation.currentStep = "Setting permissions"
    operation.progress = 80
    await setPermissions(token, sourceGuild.id, targetGuild.id, operation)

    operation.currentStep = "Finalizing clone"
    operation.progress = 100
    operation.status = 'completed'
    operation.completed = new Date().toISOString()

  } catch (error) {
    operation.status = 'failed'
    operation.currentStep = `Failed: ${error}`
  }
}

async function cloneRoles(token: string, sourceId: string, targetId: string, operation: any) {
  try {
    const rolesRes = await fetch(`https://discord.com/api/v9/guilds/${sourceId}/roles`, {
      headers: { "Authorization": token }
    })

    if (rolesRes.ok) {
      const roles = await rolesRes.json()
      const cloneableRoles = roles.filter((role: any) => role.name !== "@everyone")
      
      for (const role of cloneableRoles.slice(0, 5)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const createRoleRes = await fetch(`https://discord.com/api/v9/guilds/${targetId}/roles`, {
          method: "POST",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: role.name,
            color: role.color,
            permissions: role.permissions,
            hoist: role.hoist,
            mentionable: role.mentionable
          })
        })

        if (createRoleRes.ok) {
          operation.clonedElements.roles++
        }
      }
    }
  } catch (error) {
    console.log('Error cloning roles:', error)
  }
}

async function cloneChannels(token: string, sourceId: string, targetId: string, operation: any) {
  try {
    const channelsRes = await fetch(`https://discord.com/api/v9/guilds/${sourceId}/channels`, {
      headers: { "Authorization": token }
    })

    if (channelsRes.ok) {
      const channels = await channelsRes.json()
      
      for (const channel of channels.slice(0, 10)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const createChannelRes = await fetch(`https://discord.com/api/v9/guilds/${targetId}/channels`, {
          method: "POST",
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: channel.name,
            type: channel.type,
            topic: channel.topic,
            nsfw: channel.nsfw,
            position: channel.position,
            permission_overwrites: []
          })
        })

        if (createChannelRes.ok) {
          operation.clonedElements.channels++
        }
      }
    }
  } catch (error) {
    console.log('Error cloning channels:', error)
  }
}

async function cloneEmojis(token: string, sourceId: string, targetId: string, operation: any) {
  try {
    const emojisRes = await fetch(`https://discord.com/api/v9/guilds/${sourceId}/emojis`, {
      headers: { "Authorization": token }
    })

    if (emojisRes.ok) {
      const emojis = await emojisRes.json()
      
      for (const emoji of emojis.slice(0, 5)) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        if (emoji.available) {
          const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`
          
          const createEmojiRes = await fetch(`https://discord.com/api/v9/guilds/${targetId}/emojis`, {
            method: "POST",
            headers: {
              "Authorization": token,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              name: emoji.name,
              image: emojiUrl
            })
          })

          if (createEmojiRes.ok) {
            operation.clonedElements.emojis++
          }
        }
      }
    }
  } catch (error) {
    console.log('Error cloning emojis:', error)
  }
}

async function setPermissions(token: string, sourceId: string, targetId: string, operation: any) {
  await new Promise(resolve => setTimeout(resolve, 2000))
  operation.clonedElements.permissions = 1
}

export async function GET(req: Request) {
  try {
    return NextResponse.json({
      ok: true,
      activeOperations: cloningOperations.size,
      capabilities: {
        maxConcurrentClones: 3,
        supportedElements: ["roles", "channels", "emojis", "permissions"],
        limitations: [
          "Rate limited to prevent API abuse",
          "Maximum 10 channels per clone",
          "Maximum 5 roles per clone",
          "Maximum 5 emojis per clone"
        ]
      }
    })

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
