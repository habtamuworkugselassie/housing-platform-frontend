#!/usr/bin/env node
/**
 * Script to update imports in Vue files to use feature-based architecture
 * 
 * Usage: node scripts/update-imports.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const replacements = [
  // Auth imports
  {
    from: /from ['"]@\/stores\/auth['"]/g,
    to: "from '@/features/auth'"
  },
  {
    from: /from ['"]@\/services\/api['"]/g,
    to: "from '@/shared/api/client'"
  },
  // Component imports
  {
    from: /import NavBar from ['"]@\/components\/NavBar\.vue['"]/g,
    to: "import { NavBar } from '@/shared/components'"
  },
  // View imports in router (already handled, but keep for reference)
]

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let modified = false

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to)
        modified = true
      }
    })

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✓ Updated: ${filePath}`)
      return true
    }
    return false
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message)
    return false
  }
}

function findVueFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findVueFiles(fullPath))
    } else if (item.endsWith('.vue') || item.endsWith('.js') || item.endsWith('.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

// Main execution
const srcDir = path.join(__dirname, '../src')
const files = findVueFiles(srcDir)

console.log(`Found ${files.length} files to check...\n`)

let updatedCount = 0
files.forEach(file => {
  if (updateFile(file)) {
    updatedCount++
  }
})

console.log(`\n✓ Updated ${updatedCount} files`)
