import { NextResponse } from "next/server"

const scrapedDataStorage = new Map<string, {
  scrapes: Array<{
    id: string,
    serverId: string,
    serverName: string,
    scrapedAt: string,
    scrapedBy: string,
    includeMessages: boolean,
    data: any
  }>
}>()

export async function POST(req: Request) {
  try {
    const { action, token, serverId, inviteLink, includeMessages = false, scrapeId } = await req.json()

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
    const userId = user.id

    if (!scrapedDataStorage.has(userId)) {
      scrapedDataStorage.set(userId, { scrapes: [] })
    }

    switch (action) {
      case "scrape":
        let targetServerId = serverId

        if (inviteLink && !serverId) {
          const inviteMatch = inviteLink.match(/(?:discord\.gg\/|discord\.com\/invite\/)([a-zA-Z0-9]+)/)
          if (!inviteMatch) {
            return NextResponse.json({ ok: false, error: "Invalid invite link format" }, { status: 400 })
          }

          const inviteCode = inviteMatch[1]
          try {
            const inviteRes = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`, {
              headers: { "Authorization": token }
            })

            if (inviteRes.ok) {
              const inviteData = await inviteRes.json()
              targetServerId = inviteData.guild?.id
              
              if (!targetServerId) {
                return NextResponse.json({ ok: false, error: "Could not resolve server from invite" }, { status: 400 })
              }
            } else {
              return NextResponse.json({ ok: false, error: "Invalid or expired invite" }, { status: 400 })
            }
          } catch (error) {
            return NextResponse.json({ ok: false, error: "Failed to resolve invite" }, { status: 500 })
          }
        }

        if (!targetServerId) {
          return NextResponse.json({ ok: false, error: "Missing server ID or invite link" }, { status: 400 })
        }

        try {
          const guildRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}`, {
            headers: { "Authorization": token }
          })

          if (!guildRes.ok) {
            if (guildRes.status === 403) {
              return NextResponse.json({ ok: false, error: "No access to this server. You must be a member." }, { status: 403 })
            }
            return NextResponse.json({ ok: false, error: "Server not found or inaccessible" }, { status: 404 })
          }

          const guild = await guildRes.json()

          const channelsRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}/channels`, {
            headers: { "Authorization": token }
          })

          let channels = []
          if (channelsRes.ok) {
            channels = await channelsRes.json()
          }

          const rolesRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}/roles`, {
            headers: { "Authorization": token }
          })

          let roles = []
          if (rolesRes.ok) {
            roles = await rolesRes.json()
          }

          const membersRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}/members?limit=1000`, {
            headers: { "Authorization": token }
          })

          let memberCount = guild.member_count || 0
          let members = []
          if (membersRes.ok) {
            members = await membersRes.json()
          }

          const emojisRes = await fetch(`https://discord.com/api/v9/guilds/${targetServerId}/emojis`, {
            headers: { "Authorization": token }
          })

          let emojis = []
          if (emojisRes.ok) {
            emojis = await emojisRes.json()
          }

          let messages = []
          if (includeMessages) {
            try {
              const textChannels = channels.filter((ch: any) => ch.type === 0).slice(0, 5)
              
              for (const channel of textChannels) {
                try {
                  const messagesRes = await fetch(`https://discord.com/api/v9/channels/${channel.id}/messages?limit=50`, {
                    headers: { "Authorization": token }
                  })
                  
                  if (messagesRes.ok) {
                    const channelMessages = await messagesRes.json()
                    messages.push({
                      channelId: channel.id,
                      channelName: channel.name,
                      messages: channelMessages.map((msg: any) => ({
                        id: msg.id,
                        content: msg.content,
                        author: {
                          id: msg.author?.id,
                          username: msg.author?.username,
                          discriminator: msg.author?.discriminator
                        },
                        timestamp: msg.timestamp,
                        attachments: msg.attachments?.map((att: any) => ({
                          id: att.id,
                          filename: att.filename,
                          url: att.url,
                          size: att.size
                        })) || []
                      }))
                    })
                  }
                  
                  await new Promise(resolve => setTimeout(resolve, 1000))
                } catch (error) {
                  console.log(`Error scraping messages from channel ${channel.name}:`, error)
                }
              }
            } catch (error) {
              console.log('Error scraping messages:', error)
            }
          }

          const scrapedData = {
            guild: {
              id: guild.id,
              name: guild.name,
              description: guild.description,
              icon: guild.icon,
              banner: guild.banner,
              owner_id: guild.owner_id,
              member_count: memberCount,
              created_at: guild.id ? new Date((parseInt(guild.id) / 4194304) + 1420070400000).toISOString() : null,
              verification_level: guild.verification_level,
              features: guild.features || []
            },
            channels: channels.map((channel: any) => ({
              id: channel.id,
              name: channel.name,
              type: channel.type,
              position: channel.position,
              parent_id: channel.parent_id,
              topic: channel.topic,
              nsfw: channel.nsfw,
              permission_overwrites: channel.permission_overwrites || []
            })),
            roles: roles.map((role: any) => ({
              id: role.id,
              name: role.name,
              color: role.color,
              permissions: role.permissions,
              position: role.position,
              mentionable: role.mentionable,
              hoist: role.hoist
            })),
            emojis: emojis.map((emoji: any) => ({
              id: emoji.id,
              name: emoji.name,
              animated: emoji.animated,
              available: emoji.available
            })),
            members: members.slice(0, 100).map((member: any) => ({
              id: member.user?.id,
              username: member.user?.username,
              discriminator: member.user?.discriminator,
              nickname: member.nick,
              joined_at: member.joined_at,
              roles: member.roles || []
            })),
            messages: includeMessages ? messages : undefined,
            stats: {
              total_channels: channels.length,
              total_roles: roles.length,
              total_emojis: emojis.length,
              scraped_members: members.length,
              total_members: memberCount,
              total_messages: includeMessages ? messages.reduce((sum, ch) => sum + ch.messages.length, 0) : 0
            }
          }

          const userScrapes = scrapedDataStorage.get(userId)!
          const newScrapeId = `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          userScrapes.scrapes.push({
            id: newScrapeId,
            serverId: targetServerId,
            serverName: guild.name,
            scrapedAt: new Date().toISOString(),
            scrapedBy: user.username,
            includeMessages,
            data: scrapedData
          })

          return NextResponse.json({
            ok: true,
            message: `Successfully scraped server: ${guild.name}${includeMessages ? ' (including messages)' : ''}`,
            data: scrapedData,
            scrapeId: newScrapeId,
            scraper: user.username
          })
        } catch (error) {
          return NextResponse.json({ ok: false, error: "Failed to scrape server data" }, { status: 500 })
        }

      case "list_scrapes":
        const userScrapes = scrapedDataStorage.get(userId)
        return NextResponse.json({
          ok: true,
          scrapes: userScrapes?.scrapes.map(scrape => ({
            id: scrape.id,
            serverId: scrape.serverId,
            serverName: scrape.serverName,
            scrapedAt: scrape.scrapedAt,
            scrapedBy: scrape.scrapedBy,
            includeMessages: scrape.includeMessages,
            stats: scrape.data.stats
          })) || []
        })

      case "get_scrape":
        if (!scrapeId) {
          return NextResponse.json({ ok: false, error: "Scrape ID required" }, { status: 400 })
        }

        const userScrapesData = scrapedDataStorage.get(userId)
        const scrape = userScrapesData?.scrapes.find(s => s.id === scrapeId)
        
        if (!scrape) {
          return NextResponse.json({ ok: false, error: "Scrape not found" }, { status: 404 })
        }

        return NextResponse.json({
          ok: true,
          scrape
        })

      case "delete_scrape":
        if (!scrapeId) {
          return NextResponse.json({ ok: false, error: "Scrape ID required" }, { status: 400 })
        }

        const deleteUserScrapes = scrapedDataStorage.get(userId)
        if (!deleteUserScrapes) {
          return NextResponse.json({ ok: false, error: "No scrapes found" }, { status: 404 })
        }

        const scrapeIndex = deleteUserScrapes.scrapes.findIndex(s => s.id === scrapeId)
        if (scrapeIndex === -1) {
          return NextResponse.json({ ok: false, error: "Scrape not found" }, { status: 404 })
        }

        deleteUserScrapes.scrapes.splice(scrapeIndex, 1)

        return NextResponse.json({
          ok: true,
          message: "Scrape deleted successfully"
        })

      default:
        return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
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
    const userScrapes = scrapedDataStorage.get(user.id)

    return NextResponse.json({
      ok: true,
      scrapeCount: userScrapes?.scrapes.length || 0,
      capabilities: {
        server_info: true,
        channels: true,
        roles: true,
        members: "limited",
        emojis: true,
        export_formats: ["JSON", "CSV", "TXT"]
      },
      limits: {
        max_members_scraped: 1000,
        rate_limit: "50 requests per minute"
      }
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
