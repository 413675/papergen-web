import Cookies from 'js-cookie'

const TOKEN_KEY = 'papergen_token'

/**
 * JWT 存放在 Cookie 中，后端会同时读取 Cookie 和 Authorization 头。
 */
export const tokenStorage = {
  get(): string {
    return Cookies.get(TOKEN_KEY) ?? ''
  },
  set(token: string, expiresInSeconds: number): void {
    Cookies.set(TOKEN_KEY, token, {
      expires: expiresInSeconds / 86400,
      sameSite: 'lax',
    })
  },
  remove(): void {
    Cookies.remove(TOKEN_KEY)
  },
}
