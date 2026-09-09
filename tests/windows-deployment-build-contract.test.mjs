import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const nextConfig = await readFile(new URL('../next.config.mjs', import.meta.url), 'utf8')

test('Windows deployment produces a standalone server entrypoint', () => {
  assert.match(
    nextConfig,
    /output:\s*['\"]standalone['\"]/, 
    'the Windows service starts .next/standalone/server.js after the production build',
  )
})
