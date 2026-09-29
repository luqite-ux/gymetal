import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const stage=path.join(root,'output','content-release-20260921')
if(fs.existsSync(stage))throw new Error('Release staging directory already exists; do not overwrite an in-progress verification')
fs.mkdirSync(stage,{recursive:true})
const dirs=['app','components','hooks','lib','public','styles','scripts','tests','docs']
const files=['package.json','package-lock.json','next.config.mjs','next-env.d.ts','tsconfig.json','tailwind.config.ts','postcss.config.mjs','middleware.ts','components.json']
for(const name of [...dirs,...files]) {
  const from=path.join(root,name)
  if(fs.existsSync(from))fs.cpSync(from,path.join(stage,name),{recursive:true,filter:source=>!/^\.env/.test(path.basename(source))})
}
// Build-only configuration stays in staging; packaging explicitly excludes it.
for(const name of ['.env.production.local','.env.local'])if(fs.existsSync(path.join(root,name)))fs.copyFileSync(path.join(root,name),path.join(stage,name))
console.log(stage)
