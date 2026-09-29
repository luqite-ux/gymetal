import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import React from 'react'
import * as jsx from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import * as model from '../lib/site-content-model.ts'

test('every editable measurement renders for testing equipment and offline equipment is omitted', () => {
  const content={equipment:[{id:'test',active:true,sortOrder:0,group:'testing',model:'MEASURER',nameEn:'Measurement',nameCn:'',category:'Testing',categoryCn:'',descEn:'',descCn:'',accuracy:'ACCURACY-1',range:'RANGE-2',maxDiameter:'DIAMETER-3',travel:'TRAVEL-4',translations:{},image:null},{id:'hidden',active:false,sortOrder:0,group:'testing',model:'HIDDEN',translations:{}}],parameters:{}}
  const Wrapper=({children})=>React.createElement('div',null,children)
  const icons=new Proxy({}, {get:()=>Wrapper})
  const deps={
    'react/jsx-runtime':jsx,'lucide-react':icons,
    '@/lib/language-context':{useLanguage:()=>({locale:'en',t:{equipment:{}}})},
    '@/lib/site-content-context':{useSiteContent:()=>content},
    '@/lib/site-content-model':model,'@/lib/use-page-text':{usePageText:()=>english=>english},
    '@/components/ui/card':{Card:Wrapper,CardHeader:Wrapper,CardTitle:Wrapper,CardContent:Wrapper},
    '@/components/ui/tabs':{Tabs:Wrapper,TabsList:Wrapper,TabsTrigger:Wrapper,TabsContent:Wrapper},
    '@/components/ui/badge':{Badge:Wrapper},'@/components/motion':{MotionDiv:Wrapper},
    '@/components/managed-image':{default:Wrapper},
  }
  const module={exports:{}}
  const source=fs.readFileSync(new URL('../app/(frontend)/equipment/page.tsx',import.meta.url),'utf8')
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:module.exports,module,require:k=>deps[k]})
  const html=renderToStaticMarkup(React.createElement(module.exports.default))
  for(const value of ['ACCURACY-1','RANGE-2','DIAMETER-3','TRAVEL-4'])assert.ok(html.includes(value),`${value} must appear in the actual equipment page output`)
  assert.ok(!html.includes('HIDDEN'))
})
