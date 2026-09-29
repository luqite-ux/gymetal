import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

test('failed product update never deletes the currently published image', async () => {
  let deletes=0
  const query={update(){return this},eq(){return this},then(resolve){return Promise.resolve({error:new Error('DB unavailable')}).then(resolve)}}
  const deps={
    '@/lib/admin-auth':{requireAdminSession:async()=>({tenant_id:'tenant-a'})},
    '@/lib/supabase/server':{createAdminClient:()=>({from:()=>query})},
    '@/lib/r2':{uploadToR2:async()=>({url:'https://images.example/new.jpg'}),deleteFromR2:async()=>{deletes++}},
    'next/navigation':{redirect:()=>{}},
  }
  const module={exports:{}}
  const code=ts.transpileModule(fs.readFileSync(new URL('../app/admin/products/actions.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
  vm.runInNewContext(code,{module,exports:module.exports,require:key=>deps[key],File,console})
  const form=new FormData();form.set('name','A');form.set('existing_image','https://images.example/old.jpg');form.set('image',new File(['data'],'new.jpg',{type:'image/jpeg'}))
  await assert.rejects(module.exports.updateProduct('product-a',form),/DB unavailable/)
  assert.equal(deletes,0,'the previous file must survive a failed save')
})
