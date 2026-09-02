import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const nextConfig = await readFile(new URL('../next.config.mjs', import.meta.url), 'utf8')

test('Windows deployment using next start does not require a standalone symlink bundle', () => {
  assert.doesNotMatch(
    nextConfig,
    /output:\s*['\"]standalone['\"]/, 
    'the documented npm start deployment must not require Windows to create standalone symlinks during build',
  )
})
