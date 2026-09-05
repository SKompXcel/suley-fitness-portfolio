import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'
import { cookies } from 'next/headers'
import type { AuthOptions, SessionStrategy } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { verifyPasskeyLogin } from '@/lib/passkeyLogin'
import { AUTHENTICATION_CHALLENGE_COOKIE } from '@/lib/webauthn'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[auth] missing email or password')
          throw new Error('Please enter both email and password')
        }

        const normalizedEmail = credentials.email.toLowerCase().trim()

        let user
        try {
          user = await prisma.adminUser.findUnique({
            where: { email: normalizedEmail },
          })
        } catch (err) {
          console.error('[auth] database error while looking up admin user:', err)
          throw new Error('Server error — check dev terminal for database logs')
        }

        if (!user) {
          console.log('[auth] no admin user found for', normalizedEmail)
          throw new Error(`No admin account found for "${normalizedEmail}"`)
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) {
          console.log('[auth] password mismatch for', normalizedEmail, '(entered length:', credentials.password.length, ')')
          throw new Error('Incorrect password')
        }

        console.log('[auth] success for', normalizedEmail)
        return {
          id: user.id,
          email: user.email,
          name: 'Admin',
        }
      },
    }),
    // WebAuthn passkey sign-in (Face ID / Touch ID / 1Password). The client
    // fetches POST /api/auth/passkey/options (which seals the challenge into an
    // httpOnly cookie), runs startAuthentication(), then signIn('passkey') with
    // the serialized assertion. authorize() runs inside the NextAuth route
    // handler, so next/headers cookies() can read and clear the one-time
    // challenge cookie directly. Verification lives in verifyPasskeyLogin().
    CredentialsProvider({
      id: 'passkey',
      name: 'passkey',
      credentials: {
        response: { label: 'Passkey response', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.response) {
          throw new Error('Missing passkey response')
        }

        const cookieStore = await cookies()
        const sealed = cookieStore.get(AUTHENTICATION_CHALLENGE_COOKIE)?.value
        try {
          return await verifyPasskeyLogin(credentials.response, sealed)
        } finally {
          try {
            cookieStore.delete(AUTHENTICATION_CHALLENGE_COOKIE)
          } catch {
            // Cookie mutation is only available in a route-handler scope; the
            // 5-minute TTL still bounds the challenge if this is unavailable.
          }
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as SessionStrategy,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = true
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub ?? '')
        session.user.isAdmin = Boolean(token.isAdmin)
      }
      return session
    },
  },
  pages: {
    signIn: '/admin/login',
  },
}
