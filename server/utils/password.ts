import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = String(stored).split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const [, saltHex, hashHex] = parts
  try {
    const salt = Buffer.from(saltHex, 'hex')
    const expected = Buffer.from(hashHex, 'hex')
    const derived = (await scryptAsync(password, salt, expected.length)) as Buffer
    if (derived.length !== expected.length) return false
    return timingSafeEqual(derived, expected)
  }
  catch {
    return false
  }
}
