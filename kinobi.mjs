import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs/promises'
import { renderRustVisitor } from '@kinobi-so/renderers'
import { rootNodeFromAnchor } from '@kinobi-so/nodes-from-anchor'
import { readJson } from '@kinobi-so/renderers-core'
import { visit } from '@kinobi-so/visitors-core'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const idlDir = path.join(__dirname, 'target', 'idl')
const idlFiles = await fs.readdir(idlDir)

const clients = [
  // { type: "JS", dir: "packages/{sdk}-sdk/src/generated", renderVisitor: renderJavaScriptVisitor },
  // { type: "Umi", dir: "packages/{sdk}-sdk/src/generated", renderVisitor: renderJavaScriptUmiVisitor },
  { type: 'Rust', dir: 'crates/{sdk}-client/src/generated', renderVisitor: renderRustVisitor },
]

for (const idlFile of idlFiles) {
  const idlPath = path.join(idlDir, idlFile)
  const idl = readJson(idlPath)

  const node = rootNodeFromAnchor(idl)
  const sdkName = (idl.metadata.name ?? idlFile.split('.')[0])
    .replaceAll(/_/g, '-')
    .toLowerCase()

  for (const { dir, type, renderVisitor } of clients) {
    const path = dir.replaceAll('{sdk}', sdkName)
    visit(node, renderVisitor(path, { formatCode: true }))
    console.log(`✅ Successfully generated ${type} client for directory: ${path}!`)
  }
}
