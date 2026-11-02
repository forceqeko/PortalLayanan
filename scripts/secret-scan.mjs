import fs from 'node:fs'
import path from 'node:path'

/**
 * Secret Scan Guardrail (PRD §18.3, UAT-20)
 * Ensures no secrets, tokens, or private keys exist in frontend source or bundle.
 */

const ROOT = process.cwd()
const TARGET_DIRS = ['src', 'public', 'dist'].map((d) => path.join(ROOT, d))

const FORBIDDEN_PATTERNS = [
  { name: 'Private Key Header', regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'GitHub Token', regex: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
  { name: 'Azure Storage Connection String', regex: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+/i },
  { name: 'Hardcoded Bearer / Graph Secret', regex: /\b(client_secret|AZURE_CLIENT_SECRET|GRAPH_CLIENT_SECRET|WHATSAPP_ACCESS_TOKEN)\s*[:=]\s*['"][^'"]{8,}['"]/i },
  { name: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
]

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '.html',
  '.css',
  '.svg',
])

let findings = []

function scanDir(dirPath) {
  if (!fs.existsSync(dirPath)) return
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      scanDir(fullPath)
    } else if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      const content = fs.readFileSync(fullPath, 'utf8')
      for (const rule of FORBIDDEN_PATTERNS) {
        if (rule.regex.test(content)) {
          findings.push({
            file: path.relative(ROOT, fullPath),
            rule: rule.name,
          })
        }
      }
    }
  }
}

for (const dir of TARGET_DIRS) {
  scanDir(dir)
}

if (findings.length > 0) {
  console.error('❌ Secret scan FAILED (UAT-20):')
  for (const f of findings) {
    console.error(`  - [${f.rule}] in ${f.file}`)
  }
  process.exit(1)
} else {
  console.log('✅ Secret scan PASSED (UAT-20): Zero secrets detected in frontend source/bundle.')
}

