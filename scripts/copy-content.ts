import { copyFile, mkdir, readdir, rm, stat } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// Configure which path prefixes to copy
const prefixes: Array<string> = [
  // Add your prefixes here, e.g.:
  // 'blog/',
  // 'docs/',
  // 'tutorials/',
  'vilas/',
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Paths relative to the script location
const SOURCE_DIR = join(__dirname, '../../../writing/fujikara')
const TARGET_DIR = join(__dirname, '../mdx')

interface CopyStats {
  copied: number
  skipped: number
  deleted: number
}

async function clearTargetDirectory(): Promise<number> {
  console.log('🗑️  Clearing target directory...')
  let deletedCount = 0

  try {
    const entries = await readdir(TARGET_DIR, { withFileTypes: true })

    for (const entry of entries) {
      // Skip .gitkeep file
      if (entry.name === '.gitkeep') {
        continue
      }

      const fullPath = join(TARGET_DIR, entry.name)
      await rm(fullPath, { recursive: true, force: true })
      deletedCount++
      console.log(`  ❌ Deleted: ${entry.name}`)
    }

    console.log(`✅ Cleared ${deletedCount} items from target directory\n`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('  ℹ️  Target directory does not exist yet\n')
    } else {
      throw error
    }
  }

  return deletedCount
}

async function shouldCopyFile(relativePath: string): Promise<boolean> {
  // If no prefixes configured, copy all files
  if (prefixes.length === 0) {
    return true
  }

  // Check if file path starts with any of the configured prefixes
  return prefixes.some((prefix) => relativePath.startsWith(prefix))
}

async function copyDirectory(
  source: string,
  target: string,
  stats: CopyStats,
  baseSource: string,
): Promise<void> {
  const entries = await readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = join(source, entry.name)
    const targetPath = join(target, entry.name)
    const relativePath = relative(baseSource, sourcePath)

    if (entry.isDirectory()) {
      // Recursively process directories
      await copyDirectory(sourcePath, targetPath, stats, baseSource)
    } else if (entry.isFile()) {
      // Check if file should be copied based on prefix
      if (await shouldCopyFile(relativePath)) {
        // Ensure target directory exists
        await mkdir(dirname(targetPath), { recursive: true })

        // Copy the file
        await copyFile(sourcePath, targetPath)
        stats.copied++
        console.log(`  ✅ Copied: ${relativePath}`)
      } else {
        stats.skipped++
        console.log(`  ⏭️  Skipped: ${relativePath}`)
      }
    }
  }
}

async function main() {
  console.log('📦 Content Copy Script\n')
  console.log(`Source: ${SOURCE_DIR}`)
  console.log(`Target: ${TARGET_DIR}`)
  console.log(
    `Prefixes: ${prefixes.length === 0 ? 'ALL FILES' : prefixes.join(', ')}\n`,
  )

  const stats: CopyStats = {
    copied: 0,
    skipped: 0,
    deleted: 0,
  }

  try {
    // Check if source directory exists
    try {
      await stat(SOURCE_DIR)
    } catch (error) {
      console.error(`❌ Error: Source directory does not exist: ${SOURCE_DIR}`)
      process.exit(1)
    }

    // Clear target directory (except .gitkeep)
    stats.deleted = await clearTargetDirectory()

    // Ensure target directory exists
    await mkdir(TARGET_DIR, { recursive: true })

    // Copy files
    console.log('📋 Copying files...\n')
    await copyDirectory(SOURCE_DIR, TARGET_DIR, stats, SOURCE_DIR)

    // Print summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 Summary:')
    console.log(`  Deleted: ${stats.deleted} items`)
    console.log(`  Copied: ${stats.copied} files`)
    console.log(`  Skipped: ${stats.skipped} files`)
    console.log('='.repeat(50))
    console.log('\n✨ Done!')
  } catch (error) {
    console.error('\n❌ Error occurred:', error)
    process.exit(1)
  }
}

main()
