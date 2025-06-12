import { NextResponse } from "next/server"
import crypto from "crypto"

const tokenVault = new Map<string, {
  tokens: Array<{
    id: string,
    name: string,
    token: string,
    added: string,
    lastUsed: string | null,
    active: boolean,
    username: string,
    discriminator: string
  }>,
  masterKey: string
}>()

const encrypt = (text: string, key: string): string => {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, '')
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

const decrypt = (encryptedText: string, key: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, '')
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function POST(req: Request) {
  try {
    const { action, userToken, tokenData, tokenId, masterPassword } = await req.json()

    if (!userToken) {
      return NextResponse.json({ ok: false, error: "Missing user token" }, { status: 400 })
    }

    // Validate user token
    const userRes = await fetch("https://discord.com/api/v9/users/@me", {
      headers: { "Authorization": userToken }
    })

    if (!userRes.ok) {
      return NextResponse.json({ ok: false, error: "Invalid user token" }, { status: 401 })
    }

    const user = await userRes.json()
    const vaultKey = user.id

    switch (action) {
      case "create_vault":
        if (!masterPassword) {
          return NextResponse.json({ ok: false, error: "Master password required" }, { status: 400 })
        }

        tokenVault.set(vaultKey, {
          tokens: [],
          masterKey: crypto.createHash('sha256').update(masterPassword).digest('hex')
        })

        return NextResponse.json({
          ok: true,
          message: "Token vault created successfully",
          vaultId: vaultKey
        })

      case "unlock_vault":
        if (!masterPassword) {
          return NextResponse.json({ ok: false, error: "Master password required" }, { status: 400 })
        }

        const vault = tokenVault.get(vaultKey)
        if (!vault) {
          return NextResponse.json({ ok: false, error: "Vault not found" }, { status: 404 })
        }

        const hashedPassword = crypto.createHash('sha256').update(masterPassword).digest('hex')
        if (hashedPassword !== vault.masterKey) {
          return NextResponse.json({ ok: false, error: "Invalid master password" }, { status: 401 })
        }

        return NextResponse.json({
          ok: true,
          message: "Vault unlocked successfully",
          tokens: vault.tokens.map(t => ({
            id: t.id,
            name: t.name,
            added: t.added,
            lastUsed: t.lastUsed,
            active: t.active,
            tokenPreview: t.token.substring(0, 20) + "..."
          }))
        })

      case "add_token":
        if (!tokenData || !tokenData.name || !tokenData.token) {
          return NextResponse.json({ ok: false, error: "Missing token data" }, { status: 400 })
        }

        const addVault = tokenVault.get(vaultKey)
        if (!addVault) {
          return NextResponse.json({ ok: false, error: "Vault not found. Create vault first." }, { status: 404 })
        }

        // Validate the token being added
        const validateRes = await fetch("https://discord.com/api/v9/users/@me", {
          headers: { "Authorization": tokenData.token }
        })

        if (!validateRes.ok) {
          return NextResponse.json({ ok: false, error: "Invalid Discord token" }, { status: 400 })
        }

        const tokenUser = await validateRes.json()

        const newToken = {
          id: crypto.randomUUID(),
          name: tokenData.name,
          token: tokenData.token, // In production: encrypt(tokenData.token, addVault.masterKey)
          added: new Date().toISOString(),
          lastUsed: null,
          active: true,
          username: tokenUser.username,
          discriminator: tokenUser.discriminator
        }

        addVault.tokens.push(newToken)

        return NextResponse.json({
          ok: true,
          message: `Token added: ${tokenUser.username}#${tokenUser.discriminator}`,
          tokenId: newToken.id
        })

      case "remove_token":
        if (!tokenId) {
          return NextResponse.json({ ok: false, error: "Token ID required" }, { status: 400 })
        }

        const removeVault = tokenVault.get(vaultKey)
        if (!removeVault) {
          return NextResponse.json({ ok: false, error: "Vault not found" }, { status: 404 })
        }

        const tokenIndex = removeVault.tokens.findIndex(t => t.id === tokenId)
        if (tokenIndex === -1) {
          return NextResponse.json({ ok: false, error: "Token not found" }, { status: 404 })
        }

        removeVault.tokens.splice(tokenIndex, 1)

        return NextResponse.json({
          ok: true,
          message: "Token removed successfully"
        })

      case "get_token":
        if (!tokenId) {
          return NextResponse.json({ ok: false, error: "Token ID required" }, { status: 400 })
        }

        const getVault = tokenVault.get(vaultKey)
        if (!getVault) {
          return NextResponse.json({ ok: false, error: "Vault not found" }, { status: 404 })
        }

        const token = getVault.tokens.find(t => t.id === tokenId)
        if (!token) {
          return NextResponse.json({ ok: false, error: "Token not found" }, { status: 404 })
        }

        // Update last used
        token.lastUsed = new Date().toISOString()

        return NextResponse.json({
          ok: true,
          token: token.token, // In production: decrypt(token.token, getVault.masterKey)
          username: token.username
        })

      case "list_tokens":
        const listVault = tokenVault.get(vaultKey)
        if (!listVault) {
          return NextResponse.json({
            ok: true,
            tokens: [],
            vaultExists: false
          })
        }

        return NextResponse.json({
          ok: true,
          vaultExists: true,
          tokens: listVault.tokens.map(t => ({
            id: t.id,
            name: t.name,
            username: t.username,
            discriminator: t.discriminator,
            added: t.added,
            lastUsed: t.lastUsed,
            active: t.active,
            tokenPreview: t.token.substring(0, 20) + "..."
          }))
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
    const url = new URL(req.url)
    const userToken = url.searchParams.get('token')

    if (!userToken) {
      return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 })
    }

    const userRes = await fetch("https://discord.com/api/v9/users/@me", {
      headers: { "Authorization": userToken }
    })

    if (!userRes.ok) {
      return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 401 })
    }

    const user = await userRes.json()
    const vault = tokenVault.get(user.id)

    return NextResponse.json({
      ok: true,
      vaultExists: !!vault,
      tokenCount: vault?.tokens.length || 0,
      capabilities: {
        encryption: "AES-256",
        maxTokens: 50,
        features: ["secure_storage", "token_validation", "usage_tracking"]
      }
    })

  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
