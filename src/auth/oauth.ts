import http from 'http'
import crypto from 'crypto'
import { exec } from 'child_process'

interface TokenSet {
  access_token: string
  refresh_token?: string
  expires_at: number // ms since epoch
}

export class OAuthClient {
  private tokenSet: TokenSet | null = null

  constructor(
    private readonly keycloakUrl: string,
    private readonly realm: string,
    private readonly clientId: string,
    private readonly redirectPort: number = 3000,
  ) {}

  private get authEndpoint(): string {
    return `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/auth`
  }

  private get tokenEndpoint(): string {
    return `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`
  }

  private get redirectUri(): string {
    return `http://localhost:${this.redirectPort}/callback`
  }

  async getAccessToken(): Promise<string> {
    if (this.tokenSet && this.tokenSet.expires_at > Date.now() + 30_000) {
      return this.tokenSet.access_token
    }

    if (this.tokenSet?.refresh_token) {
      try {
        await this.refreshTokens()
        return this.tokenSet!.access_token
      } catch {
        // Refresh failed — fall through to full re-auth
        this.tokenSet = null
      }
    }

    await this.authorize()
    return this.tokenSet!.access_token
  }

  private async authorize(): Promise<void> {
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')
    const state = crypto.randomBytes(16).toString('hex')

    const authUrl = new URL(this.authEndpoint)
    authUrl.searchParams.set('client_id', this.clientId)
    authUrl.searchParams.set('redirect_uri', this.redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', 'openid')
    authUrl.searchParams.set('code_challenge', codeChallenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')
    authUrl.searchParams.set('state', state)

    const code = await this.listenForCode(authUrl.toString(), state)
    await this.exchangeCode(code, codeVerifier)
  }

  private listenForCode(authUrl: string, expectedState: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        try {
          const url = new URL(req.url ?? '/', `http://localhost:${this.redirectPort}`)
          const code = url.searchParams.get('code')
          const state = url.searchParams.get('state')
          const error = url.searchParams.get('error')
          const errorDesc = url.searchParams.get('error_description')

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' })
            res.end('<h1>Authentication failed</h1><p>You can close this tab.</p>')
            server.close()
            reject(new Error(`OAuth error: ${error}${errorDesc ? ` — ${errorDesc}` : ''}`))
            return
          }

          if (!code || state !== expectedState) {
            res.writeHead(400, { 'Content-Type': 'text/html' })
            res.end('<h1>Invalid callback</h1><p>You can close this tab.</p>')
            server.close()
            reject(new Error('OAuth callback missing code or state mismatch'))
            return
          }

          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<h1>Authentication successful!</h1><p>You can close this tab and return to your application.</p>')
          server.close()
          resolve(code)
        } catch (err) {
          server.close()
          reject(err)
        }
      })

      server.listen(this.redirectPort, () => {
        console.error(`\n[Recraft MCP] Authentication required.\nOpening browser for Keycloak login...\nIf the browser does not open, visit:\n${authUrl}\n`)
        this.openBrowser(authUrl)
      })

      server.on('error', (err) => {
        reject(new Error(`Failed to start OAuth callback server on port ${this.redirectPort}: ${err.message}`))
      })

      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        server.close()
        reject(new Error('OAuth authentication timed out after 5 minutes'))
      }, 5 * 60 * 1000)

      server.on('close', () => clearTimeout(timeout))
    })
  }

  private openBrowser(url: string): void {
    const commands: Record<string, string> = {
      darwin: `open "${url}"`,
      win32: `start "" "${url}"`,
      linux: `xdg-open "${url}"`,
    }
    const cmd = commands[process.platform] ?? commands.linux
    exec(cmd, (err) => {
      if (err) {
        console.error(`[Recraft MCP] Could not open browser automatically. Please open the URL above manually.`)
      }
    })
  }

  private async exchangeCode(code: string, codeVerifier: string): Promise<void> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeVerifier,
    })

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Token exchange failed (${response.status}): ${text}`)
    }

    this.applyTokenResponse(await response.json())
  }

  private async refreshTokens(): Promise<void> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.tokenSet!.refresh_token!,
      client_id: this.clientId,
    })

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed (${response.status})`)
    }

    this.applyTokenResponse(await response.json())
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyTokenResponse(data: any): void {
    this.tokenSet = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (Number(data.expires_in) * 1000),
    }
  }
}
