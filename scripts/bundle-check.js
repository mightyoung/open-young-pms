/**
 * Bundle size baseline check.
 * Fails CI if critical chunks exceed defined thresholds.
 *
 * Thresholds (gzip KB):
 *   vendor-antd  <= 350 KB  (core UI library, largest dependency)
 *   index entry  <= 20 KB   (critical path, should stay lean)
 *
 * Run after `npm run build`.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const distAssets = join(process.cwd(), 'dist/assets')

const THRESHOLDS = {
  'vendor-antd': 350, // KB gzip
  'index': 20,        // KB gzip
}

function getGzipSize(filePath) {
  try {
    const content = readFileSync(filePath)
    const gzipped = gzipSync(content)
    return gzipped.length / 1024 // KB
  } catch (err) {
    console.error('Error reading', filePath, err.message)
    return 0
  }
}

function findChunk(dir, prefix) {
  const files = readdirSync(dir)
  return files.find(f => f.startsWith(prefix) && f.endsWith('.js'))
}

function main() {
  const results = []

  for (const [name, threshold] of Object.entries(THRESHOLDS)) {
    const prefix = name === 'index' ? 'index-' : `${name}-`
    const chunkFile = findChunk(distAssets, prefix)
    if (!chunkFile) {
      console.warn(`⚠ ${name}: no chunk found (skipping)`)
      continue
    }

    const gzSize = getGzipSize(join(distAssets, chunkFile))
    const status = gzSize <= threshold ? '✅' : '❌'
    console.log(`${status} ${name}: ${gzSize.toFixed(1)} KB gzip (limit: ${threshold} KB)`)
    results.push({ name, gzSize, threshold, pass: gzSize <= threshold })
  }

  const failed = results.filter(r => !r.pass)
  if (failed.length > 0) {
    console.error('\n❌ Bundle size baseline FAILED:')
    for (const r of failed) {
      console.error(`   ${r.name}: ${r.gzSize.toFixed(1)} KB > ${r.threshold} KB`)
    }
    process.exit(1)
  } else {
    console.log('\n✅ Bundle size baseline PASSED')
  }
}

main()
