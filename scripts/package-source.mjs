// Produces a clean, deployable source snapshot of the *working tree*
// (not `git archive` this also picks up uncommitted work, since a
// packaging script shouldn't silently drop changes nobody has committed
// yet) into ../<project-name>-source-<timestamp>/, excluding everything a
// production/clean delivery must never ship: .git, node_modules, dist,
// any *.zip, secrets (.env / server/.env), databases, uploads, caches,
// and virtual envs. The live working repo's .git is never touched —
// this only ever reads from it and writes to a sibling output directory.
//
// Usage:
//   node scripts/package-source.mjs            # copies to a folder
//   node scripts/package-source.mjs --zip       # also zips that folder
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PROJECT_NAME = path.basename(ROOT)
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const OUT_DIR = path.resolve(ROOT, '..', `${PROJECT_NAME}-source-${timestamp}`)

// Directory names excluded wherever they appear in the tree (not just at
// the root) e.g. server/data/uploads, server/.venv, any __pycache__.
const EXCLUDED_DIR_NAMES = new Set([
  '.git', 'node_modules', 'dist', 'uploads', '.venv', 'venv',
  '__pycache__', '.pytest_cache', '.vite', 'coverage',
])

// Exact relative paths (POSIX-style, relative to ROOT) excluded regardless
// of directory-name matching above.
const EXCLUDED_RELATIVE_PATHS = new Set([
  '.env', 'server/.env', 'server/data/dev.db',
])

function isExcluded(srcPath) {
  const rel = path.relative(ROOT, srcPath).split(path.sep).join('/')
  if (rel === '') return false
  const baseName = path.basename(srcPath)
  if (EXCLUDED_DIR_NAMES.has(baseName)) return true
  if (EXCLUDED_RELATIVE_PATHS.has(rel)) return true
  if (/\.zip$/i.test(baseName)) return true
  if (/\.(pyc|pyo)$/i.test(baseName)) return true
  if (/^\.env(\..+)?$/.test(baseName) && baseName !== '.env.example') return true
  if (/\.db(-journal|-wal|-shm)?$/i.test(baseName) && rel.startsWith('server/data/')) return true
  if (rel.startsWith('server/data/') && baseName.endsWith('.json') && baseName !== 'package.json') return true
  return false
}

function main() {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  cpSync(ROOT, OUT_DIR, {
    recursive: true,
    filter: (src) => !isExcluded(src),
  })

  console.log(`[package-source] clean source copied to: ${OUT_DIR}`)

  if (process.argv.includes('--zip')) {
    const zipPath = `${OUT_DIR}.zip`
    // PowerShell's Compress-Archive ships on every Windows box this
    // project targets avoids adding a zip library dependency for a
    // one-off packaging step.
    execFileSync('powershell', [
      '-NoProfile', '-Command',
      `Compress-Archive -Path '${OUT_DIR}\\*' -DestinationPath '${zipPath}' -Force`,
    ], { stdio: 'inherit' })
    console.log(`[package-source] zipped to: ${zipPath}`)
  }
}

main()
