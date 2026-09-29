// One-time extraction from the approved site. No credentials or database writes.
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const root = path.resolve(__dirname, '..')
const cache = new Map()
function load(file) {
  if (cache.has(file)) return cache.get(file)
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file,'utf8'))
  const module = { exports: {} }
  const source = ts.transpileModule(fs.readFileSync(file,'utf8'), { compilerOptions:{ module:ts.ModuleKind.CommonJS, target:ts.ScriptTarget.ES2020 } }).outputText
  vm.runInNewContext(source, { module, exports:module.exports, require:(p) => load(path.resolve(path.dirname(file),p + (path.extname(p) ? '' : '.ts'))) })
  cache.set(file,module.exports)
  return module.exports
}
const { getTranslations } = load(path.join(root,'lib/i18n.ts'))
const generated = load(path.join(root,'lib/generated-page-translations.json'))
const locales = ['en','zh','es','pt','fr','ar','el','ru','de','nl','it']
const equipmentSource = require('node:child_process').execFileSync('git',['show','d844a4a:app/(frontend)/equipment/page.tsx'],{cwd:root,encoding:'utf8'})
const equipment = []
for (const [name,group] of [['machiningEquipment','machining'],['testingEquipment','testing']]) {
  const tree = ts.createSourceFile('page.tsx',equipmentSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  for (const stmt of tree.statements) if (ts.isVariableStatement(stmt)) for (const decl of stmt.declarationList.declarations) {
    if (decl.name.getText(tree) !== name) continue
    const items = vm.runInNewContext('(' + decl.initializer.getText(tree) + ')')
    items.forEach((item,index) => {
      const translations = {}
      for (const lang of locales.filter(l => !['en','zh'].includes(l))) translations[lang] = {
        name: generated[lang]?.[item.nameEn] || item.nameEn,
        category: generated[lang]?.[item.category] || item.category,
        description: generated[lang]?.[item.descEn] || item.descEn,
      }
      equipment.push({...item, group, active:true, sortOrder:index, translations})
    })
  }
}
if (equipment.length !== 23) throw new Error('Expected the approved 23 equipment records; extraction is not a recurring seed')
const texts = {}, labels = {}, images = {}
const usedKeys = new Set()
function scan(dir) {for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name)
  if(entry.isDirectory())scan(file)
  else if(/\.tsx$/.test(file))for(const m of fs.readFileSync(file,'utf8').matchAll(/\bt\.[A-Za-z]\w*\.[A-Za-z]\w*/g))usedKeys.add(m[0])
}}
scan(path.join(root,'app/(frontend)'));scan(path.join(root,'components'))
function flatten(value,prefix,output) {
  for(const [key,item] of Object.entries(value)) {
    if(typeof item === 'string') output[prefix+key] = item
    else if(item && !Array.isArray(item)) flatten(item,prefix+key+'.',output)
  }
}
const dictionaries = Object.fromEntries(locales.map(locale => { const flat={}; flatten(getTranslations(locale),'t.',flat); return [locale,flat] }))
for(const key of Object.keys(dictionaries.en)) {
  if (!/^t\.(hero|about|services|specs|stats|industries|materials|equipment)\./.test(key)) continue
  if (!usedKeys.has(key)) continue
  texts[key] = Object.fromEntries(locales.map(locale => [locale,dictionaries[locale][key] ?? dictionaries.en[key]]))
  labels[key] = { label:dictionaries.zh[key] || dictionaries.en[key], page:'通用图文 / 参数' }
}
for(const [slug,name] of [['','首页'],['about','关于我们'],['services','服务与参数'],['equipment','设备页'],['faq','常见问题'],['contact','联系页']]) {
  const file = path.join(root,'app/(frontend)',slug,'page.tsx')
  const source = fs.readFileSync(file,'utf8')
  const tree = ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  function visit(node) {
    if(slug==='faq' && ts.isObjectLiteralExpression(node)) {
      const properties=Object.fromEntries(node.properties.filter(p=>ts.isPropertyAssignment(p)&&ts.isStringLiteral(p.initializer)).map(p=>[p.name.getText(tree),p.initializer.text]))
      const pairs=properties.qEn ? [[properties.qEn,properties.qZh,'faq:'+properties.qEn+':question'],[properties.aEn,properties.aZh,'faq:'+properties.qEn+':answer']] : properties.titleEn ? [[properties.titleEn,properties.titleZh,properties.titleEn]] : []
      for(const [english,chinese,key] of pairs){
        texts['l:'+key]=Object.fromEntries(locales.map(locale=>[locale,locale==='en'?english:locale==='zh'?chinese:generated[locale]?.[english]||english]))
        labels['l:'+key]={label:properties.qZh ? properties.qZh+(key.endsWith(':answer')?' · 答案':' · 问题') : chinese,page:name}
      }
    }
    if (ts.isCallExpression(node) && node.expression.getText(tree)==='l' && ts.isStringLiteral(node.arguments[0])) {
      const english=node.arguments[0].text, chinese=node.arguments[1] && ts.isStringLiteral(node.arguments[1]) ? node.arguments[1].text : english
      texts['l:'+english] = Object.fromEntries(locales.map(locale => [locale, locale==='en' ? english : locale==='zh' ? chinese : generated[locale]?.[english] || english]))
      labels['l:'+english] = {label:chinese,page:name}
    }
    if (ts.isStringLiteral(node) && /^\/images\//.test(node.text) && !node.text.includes('/equipment/') && !(slug==='equipment'&&['/images/3.jpg','/images/9.jpg'].includes(node.text))) images['/'+slug+':'+node.text] = node.text
    ts.forEachChild(node,visit)
  }
  visit(tree)
}
const parameters = { homeYears:'17+', homePrecision:'±0.005mm', homeEmployees:'50+', homeMachines:'20+', equipmentAccuracy:'0.001mm', equipmentSize:'5500mm' }
fs.writeFileSync(path.join(root,'lib/site-content-defaults.json'), JSON.stringify({version:1,texts,images,equipment,parameters},null,2)+'\n','utf8')
fs.writeFileSync(path.join(root,'lib/site-content-labels.json'), JSON.stringify(labels,null,2)+'\n','utf8')
console.log(JSON.stringify({equipment:equipment.length,texts:Object.keys(texts).length,imageSlots:Object.keys(images).length}))
