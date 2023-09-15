import type {
  FetchMiddleware,
} from '@solana/web3.js'

interface ITokenStorage {
  setToken(token: string): void
  getToken(): string | null
  getTimeSinceLastSet(): number | null
}

export class LocalTokenStorage implements ITokenStorage {
  constructor(readonly storage: Storage) {
  }

  setToken(token: string): void {
    this.storage.setItem('auth-token', token)
    this.storage.setItem('last-set', String(new Date().valueOf()))
  }

  getTimeSinceLastSet(): number | null {
    if (this.storage.getItem('last-set')) {
      return new Date().valueOf() - Number(this.storage.getItem('last-set'))
    }
    return null
  }

  getToken(): string | null {
    return this.storage.getItem('auth-token')
  }
}

export interface ITokenAuthFetchMiddlewareArgs {
  /**
   * An api endpoint to get a new token. Default /api/get-token
   */
  getTokenUrl?: string
  /**
   * Optionally override the default storage mechanism of localStorage
   */
  tokenStorage?: ITokenStorage
  /**
   * Number of milliseconds until token expiry. Default 5 minutes
   */
  tokenExpiry?: number

  /**
   * Logic to get an authorization token
   */
  getToken: () => Promise<string>
}

export function tokenAuthFetchMiddleware({
  tokenStorage = new LocalTokenStorage(window?.localStorage ?? {}),
  tokenExpiry = 5 * 60 * 1000, // 5 minutes
  getToken,
}: ITokenAuthFetchMiddlewareArgs): FetchMiddleware {
  return (url: string, options: any, fetch: Function) => {
    (async () => {
      try {
        const token = tokenStorage.getToken()
        const timeSinceLastSet = tokenStorage.getTimeSinceLastSet()
        const tokenIsValid
          = token && token !== 'undefined' && timeSinceLastSet && timeSinceLastSet < tokenExpiry
        if (!tokenIsValid) {
          tokenStorage.setToken(await getToken())
        }
      } catch (e: any) {
        console.error(e)
      }
      fetch(url, {
        ...(options || {}),
        headers: {
          ...(options || {}).headers,
          Authorization: `Bearer ${tokenStorage.getToken()}`,
        },
      })
    })()
  }
}
