const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function getGitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch (e) {
    return 'nogit'
  }
}

const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14)
const buildId = `${stamp}-${getGitHash()}`

const payload = {
  buildId,
  builtAt: new Date().toISOString()
}

const outDir = path.join(__dirname, '..', 'dist')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'version.json'), JSON.stringify(payload, null, 2))
console.log('version.json written:', JSON.stringify(payload))