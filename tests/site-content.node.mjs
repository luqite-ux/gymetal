import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
const file = new URL('../lib/site-content-model.ts', import.meta.url)
const model = existsSync(file) ? await import(pathToFileURL(file.pathname.replace(/^\/(\w:)/, '$1')).href) : {}

test('published equipment excludes offline records and sorts without resurrecting removed equipment', () => {
  assert.equal(typeof model.visibleEquipment, 'function')
  const result = model.visibleEquipment([
    { id: 'a', group: 'machining', active: true, sortOrder: 9 },
    { id: 'b', group: 'machining', active: false, sortOrder: 0 },
    { id: 'c', group: 'machining', active: true, sortOrder: 1 },
  ], 'machining')
  assert.deepEqual(result.map(x => x.id), ['c', 'a'])
  assert.deepEqual(model.visibleEquipment([], 'machining'), [])
})

test('language selection retains original translations but falls back to edited English for new content', () => {
  assert.equal(typeof model.contentText, 'function')
  assert.equal(model.contentText({ en: 'New', de: 'Neu' }, 'de', 'Old'), 'Neu')
  assert.equal(model.contentText({ en: 'New' }, 'fr', 'Old'), 'New')
  assert.equal(model.contentText({}, 'fr', 'Ancien'), 'Ancien')
  assert.equal(model.contentText({ en: '' }, 'en', 'Old'), '')
})

test('snapshot validator rejects script URLs, unknown layout fields and duplicate equipment IDs', () => {
  assert.equal(typeof model.validateSnapshot, 'function')
  const empty = { version: 1, texts: {}, images: {}, equipment: [], parameters: {} }
  assert.deepEqual(model.validateSnapshot(empty), empty)
  assert.throws(() => model.validateSnapshot({ ...empty, css: 'body{}' }))
  assert.throws(() => model.validateSnapshot({ ...empty, images: { '/:/images/1.jpg': 'javascript:alert(1)' } }))
  const machine = { id:'a', group:'machining', model:'A', nameEn:'A', nameCn:'', category:'Lathe', categoryCn:'', descEn:'', descCn:'', accuracy:'', image:null, active:true, sortOrder:0, translations:{} }
  assert.throws(() => model.validateSnapshot({ ...empty, equipment: [machine, machine] }))
})

test('site validation only accepts fixed slots and this tenant upload folder', () => {
  assert.equal(typeof model.validateContentForSite, 'function')
  const defaults = {version:1,texts:{'t.hero.title':{en:'Title'}},images:{'/:/images/1.jpg':'/images/1.jpg'},equipment:[],parameters:{homeYears:'17+'}}
  const snapshot = structuredClone(defaults)
  snapshot.images['/:/images/1.jpg'] = 'https://images.example/site-content/tenant-a/a.webp'
  assert.equal(model.validateContentForSite(snapshot,defaults,'https://images.example','tenant-a').images['/:/images/1.jpg'], snapshot.images['/:/images/1.jpg'])
  assert.throws(() => model.validateContentForSite(snapshot,defaults,'https://images.example','tenant-b'))
  assert.throws(() => model.validateContentForSite({...defaults,texts:{'t.hero.title':{en:'x'},'css':{en:'x'}}},defaults,'https://images.example','tenant-a'))
})

test('translation overlay updates only existing content fields without mutating static dictionaries', () => {
  assert.equal(typeof model.overlayTranslations,'function')
  const base={hero:{title:'Old'},nav:{home:'Home'}}
  const result=model.overlayTranslations(base,{'t.hero.title':{en:'New'},'t.unknown.path':{en:'Bad'}},'en')
  assert.equal(result.hero.title,'New');assert.equal(base.hero.title,'Old');assert.equal(result.nav.home,'Home');assert.equal(result.unknown,undefined)
})
