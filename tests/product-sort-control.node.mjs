import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
test('product ordering saves an explicit rank instead of ineffective one-step collisions',async()=>{
 const writes=[]
 const deps={react:{...React,useState:v=>[v,()=>{}]},'react/jsx-runtime':await import('react/jsx-runtime'),'next/navigation':{useRouter:()=>({refresh(){}})},'./actions':{updateProductOrder:async(...args)=>writes.push(args)},'@/lib/admin-image':{buildAdminPreviewUrl:u=>u}}
 const module={exports:{}}
 const code=ts.transpileModule(fs.readFileSync(new URL('../app/admin/products/products-list.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText
 vm.runInNewContext(code,{module,exports:module.exports,require:k=>deps[k]??new Proxy({},{get:(_,name)=>String(name)}),console})
 const tree=module.exports.ProductsList({products:[{id:'a',name:'A',sort_order:10},{id:'b',name:'B',sort_order:20}]})
 const nodes=[];function walk(n){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(walk);return}nodes.push(n);walk(n.props?.children)}walk(tree)
 const input=nodes.find(n=>n.props?.['aria-label']==='B 排序')
 assert.ok(input,'each product exposes an exact editable rank')
 await input.props.onBlur({currentTarget:{value:'5'}})
 assert.deepEqual(writes,[['b',5]])
})
