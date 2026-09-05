import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import type { AuthenticationResponseJSON } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getWebAuthnConfig, openChallenge } from '@/lib/webauthn'

// Core of the passkey CredentialsProvider's authorize(): verify a WebAuthn
// assertion against a stored AdminPasskey and return the same user shape the
// password provider returns. Kept out of the NextAuth options so it can be
// unit-tested without a request scope.
export async function verifyPasskeyLogin(
  responseJSON: string,
  sealedChallenge: string | undefined
): Promise<{ id: string; email: string; name: string }> {
  const challenge = openChallenge(sealedChallenge)
  if (!challenge) {
    throw new Error('Passkey challenge missing or expired — try again')
  }

  let response: AuthenticationResponseJSON
  try {
    response = JSON.parse(responseJSON)
  } catch {
    throw new Error('Malformed passkey response')
  }
  if (!response || typeof response.id !== 'string' || !response.id) {
    throw new Error('Malformed passkey response')
  }

  const passkey = await prisma.adminPasskey.findUnique({
    where: { credentialId: response.id },
    include: { adminUser: true },
  })
  if (!passkey) {
    throw new Error('This passkey is not registered — use your password instead')
  }

  const { rpID, origins } = getWebAuthnConfig()
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origins,
    expectedRPID: rpID,
    credential: {
      id: passkey.credentialId,
      publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64url')),
      counter: passkey.counter,
      transports: passkey.transports ? passkey.transports.split(',') : undefined,
    },
    // Matches userVerification: 'preferred' in the issued options — the
    // authenticator verifies the user when it can (Face ID / Touch ID always do).
    requireUserVerification: false,
  })

  if (!verification.verified) {
    throw new Error('Passkey verification failed')
  }

  await prisma.adminPasskey.update({
    where: { id: passkey.id },
    data: {
      counter: verification.authenticationInfo.newCounter,
      lastUsedAt: new Date(),
    },
  })

  return { id: passkey.adminUser.id, email: passkey.adminUser.email, name: 'Admin' }
}
