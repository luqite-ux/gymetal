import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'

test('saving product text without selecting a file retains its existing image',async()=>{
 let submitted
 const deps={
  react:{...React,useState:value=>[value,()=>{}],useRef:()=>({current:null})},
  'react/jsx-runtime':await import('react/jsx-runtime'),
  './actions':{updateProduct:async(id,form)=>{submitted=form},createProduct:async()=>{}},
  '@/lib/admin-image':{buildAdminPreviewUrl:url=>url},
 }
 const module={exports:{}}
 const code=ts.transpileModule(fs.readFileSync(new URL('../app/admin/products/product-form.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText
 vm.runInNewContext(code,{module,exports:module.exports,require:key=>deps[key]??new Proxy({},{get:(_,name)=>String(name)}),console,File})
 const tree=module.exports.ProductForm({product:{id:'test-id',name:'test',image_url:'https://images.example/original.jpg',is_active:true}})
 const form=new FormData();form.set('name','Edited text');form.set('image',new File([],'',{type:'application/octet-stream'}))
 await tree.props.action(form)
 assert.equal(submitted.get('existing_image'),'https://images.example/original.jpg')
})
