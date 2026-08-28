import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'

const root = path.resolve(import.meta.dirname, '..')

test('contact form submits the CAPTCHA fields with the first inquiry attempt', () => {
  const source = readFileSync(path.join(root, 'app/(frontend)/contact/page.tsx'), 'utf8')
  const formStart = source.indexOf('<form onSubmit={handleSubmit}')
  const formEnd = source.indexOf('</form>', formStart)

  assert.ok(formStart >= 0 && formEnd > formStart, 'contact inquiry form must exist')

  const formSource = source.slice(formStart, formEnd)
  assert.match(
    formSource,
    /<InquiryCaptchaField refreshKey=\{captchaRefreshKey\} \/>/,
    'CAPTCHA scope, token, and answer fields must be rendered inside the submitted form',
  )
  assert.equal(
    source.match(/<InquiryCaptchaField/g)?.length,
    1,
    'the page must render exactly one inquiry CAPTCHA field',
  )
})
