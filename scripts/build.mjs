#!/usr/bin/env node
import { build } from 'esbuild'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { wrapClient } from './wrap-client.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'lib')
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))

await rm(out, { recursive: true, force: true })
await mkdir(out, { recursive: true })
await cp(join(root, 'assets', 'avatars'), join(out, 'avatars'), { recursive: true })

await build({
  entryPoints: [join(root, 'src/host.js')],
  outfile: join(out, 'index.js'),
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  bundle: true,
  packages: 'external',
})

const temporaryClient = join(out, '_client.js')
await build({
  entryPoints: [join(root, 'src/client.cjs')],
  outfile: temporaryClient,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  bundle: true,
  external: ['react'],
})

const source = await readFile(temporaryClient, 'utf8')
await rm(temporaryClient)
const clientBundle = wrapClient(source, pkg.name)
await writeFile(join(out, 'client.js'), clientBundle)

new Function(clientBundle)
const host = await import(pathToFileURL(join(out, 'index.js')).href)
if (host.name !== pkg.name || typeof host.apply !== 'function') {
  throw new Error('invalid host plugin export')
}

console.log(`Built ${pkg.name} ${pkg.version}: lib/index.js and lib/client.js`)
