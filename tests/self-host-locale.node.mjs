import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import * as locales from '../lib/locales.ts'
import {NextResponse} from 'next/server.js'
test('self-hosted locale rewrites retain the raw loopback origin instead of proxying through localhost',async()=>{
 const module={exports:{}}
 const code=ts.transpileModule(fs.readFileSync(new URL('../middleware.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
 const nextUrl=new URL('http://localhost:3108/zh/equipment');nextUrl.clone=()=>new URL(nextUrl)
 vm.runInNewContext(code,{module,exports:module.exports,URL,Headers,require:k=>k==='next/server'?{NextResponse}:k==='@/lib/locales'?locales:{requestHeadersWithPathname:r=>new Headers(r.headers),updateSession:()=>{}},console})
 const response=await module.exports.middleware({url:'http://127.0.0.1:3108/zh/equipment',nextUrl,headers:new Headers({host:'www.gymetaltech.com'}),cookies:{get(){}}})
 assert.equal(response.headers.get('x-middleware-rewrite'),'http://127.0.0.1:3108/equipment')
 assert.equal(response.headers.get('x-middleware-request-x-site-locale'),'zh')
})
