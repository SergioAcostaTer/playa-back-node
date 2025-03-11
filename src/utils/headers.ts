import { IncomingMessage } from 'http'

function getTokenFromCookie(req: IncomingMessage): string | null {
  const cookies = req.headers.cookie

  if (!cookies) {
    return null
  }

  // Split the cookie string into individual cookies
  const cookieArray = cookies.split(';')

  // Iterate over each cookie to find the 'token' cookie
  for (const cookie of cookieArray) {
    const [name, value] = cookie.trim().split('=')

    if (name === 'token') {
      return value || null
    }
  }

  return null // Return null if 'token' cookie is not found
}

export { getTokenFromCookie }
