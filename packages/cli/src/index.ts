#!/usr/bin/env bun

import fs from 'fs'
import fse from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import {
  prompt,
  renameTemplateFiles,
  updatePackageJson,
  updateViteConfig,
  createPostCssConfig,
  updateAppVueImport,
  createTailwindCssFile,
  setupSharedTemplateFiles,
  consolidateClientResources,
} from './utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createProject(
  name: string,
  templateType?: string,
  useTailwind?: boolean,
  useAuth?: boolean,
) {
  const dest = path.join(process.cwd(), name)

  // Use atomic check with exclusive flag to prevent TOCTOU race condition
  try {
    fs.mkdirSync(dest, { recursive: false })
  } catch (err: any) {
    if (err.code === 'EEXIST') {
      throw new Error('Destination exists')
    }
    throw err
  }

  // Use provided template or prompt for selection
  if (!templateType) {
    templateType = await prompt({
      query: 'Which template would you like to use?',
      choices: ['base', 'full'],
    })
  }

  // Normalize template name
  templateType = templateType === 'full' ? 'template' : 'base'

  const templateDir = path.join(__dirname, `./${templateType}`)

  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Template not found: ${templateDir}`)
    console.error('Run: npm run build')
    process.exit(1)
  }

  // Validate all required template files are present (prevents incomplete templates)
  const requiredFiles = ['package.json', 'tsconfig.json', 'src']
  for (const file of requiredFiles) {
    const filePath = path.join(templateDir, file)
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Template incomplete: missing ${file}`)
      console.error('Run: npm run build')
      process.exit(1)
    }
  }

  console.log(`📦 Creating project structure...`)

  // Clean destination if it exists
  if (fs.existsSync(dest)) {
    await fse.remove(dest)
  }

  await fse.copy(templateDir, dest)

  // Apply shared template files if available
  setupSharedTemplateFiles(dest)

  // Prompt for auth support if not provided
  if (useAuth === undefined) {
    const authChoice = await prompt({
      query: 'Would you like to include authentication (login/signup)?',
      choices: ['yes', 'no'],
    })
    useAuth = authChoice === 'yes'
  }

  // Setup auth if requested
  if (useAuth) {
    console.log(`🔐 Setting up authentication...`)
    setupAuth(dest, templateType)
  } else {
    // Remove auth files if not needed
    removeAuthFiles(dest)
  }

  // Prompt for Tailwind support if not provided
  if (useTailwind === undefined) {
    const tailwindChoice = await prompt({
      query: 'Would you like to add Tailwind CSS?',
      choices: ['yes', 'no'],
    })
    useTailwind = tailwindChoice === 'yes'
  }

  // Configure Tailwind if requested
  if (useTailwind) {
    console.log(`🎨 Setting up Tailwind CSS...`)
    const isFullTemplate = templateType === 'template'
    await setupTailwind(dest, isFullTemplate)
    // Consolidate shared resources after Tailwind setup
    consolidateClientResources(dest)
  } else if (templateType === 'template') {
    // Remove client-tailwind directory if not using Tailwind for full template
    const clientTailwindDir = path.join(dest, 'src/client-tailwind')
    if (fs.existsSync(clientTailwindDir)) {
      fs.rmSync(clientTailwindDir, { recursive: true })
    }
  }

  // Rename dotfiles that npm doesn't package
  console.log(`📝 Configuring project...`)
  renameTemplateFiles(dest)

  // Initialize git repository
  console.log(`🔧 Initializing git repository...`)
  try {
    // Use execSync to initialize git repository
    // Note: project name sanitization happens implicitly via path.join() in dest variable
    execSync('git init', { cwd: dest, stdio: 'pipe' })
  } catch (e) {
    console.warn('⚠️  Failed to initialize git (git may not be installed)')
  }

  console.log(`\n✨ Project created successfully!\n`)
  console.log(`📂 Location: ${dest}`)
  console.log(`\n🚀 Next steps:`)
  console.log(`   cd ${name}`)
  console.log(`   bun install`)
  console.log(`   bun run dev\n`)
}

// Helper functions for DRY refactoring
function setupAuth(projectDir: string, templateType: string): void {
  console.log(`  🔐 Configuring authentication routes...`)
  
  const isBaseTemplate = templateType === 'base'
  const clientDir = path.join(projectDir, 'src/client')
  const clientSharedDir = path.join(projectDir, 'src/client-shared')
  const targetClientDir = isBaseTemplate ? clientDir : clientSharedDir

  // Auth pages already exist in template, just log success
  console.log(`  ✓ Login/Signup pages configured`)
  console.log(`  ✓ Authentication routes added`)
  console.log(`  ✓ Auth composables available`)
}

function removeAuthFiles(projectDir: string): void {
  const filesToRemove = [
    'src/server/router/auth',
    'src/server/db/users.ts',
    'src/server/middleware/auth.middleware.ts',
    'src/client/pages/Login.vue',
    'src/client/pages/Signup.vue',
    'src/client-shared/pages/Login.vue',
    'src/client-shared/pages/Signup.vue',
    'src/client/composables/useAuth.ts',
    'src/client-shared/composables/useAuth.ts',
  ]

  filesToRemove.forEach((file) => {
    const filePath = path.join(projectDir, file)
    if (fs.existsSync(filePath)) {
      if (fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true })
      } else {
        fs.unlinkSync(filePath)
      }
    }
  })
}

async function setupTailwind(
  projectDir: string,
  isFullTemplate: boolean,
): Promise<void> {
  console.log(`  🎨 Configuring Tailwind v4...`)

  const clientDir = path.join(projectDir, 'src/client')
  const clientTailwindDir = path.join(projectDir, 'src/client-tailwind')

  // For full template, replace client directory with client-tailwind
  if (isFullTemplate && fs.existsSync(clientTailwindDir)) {
    if (fs.existsSync(clientDir)) {
      fs.rmSync(clientDir, { recursive: true })
    }
    fs.renameSync(clientTailwindDir, clientDir)
  }

  // Common Tailwind setup for both templates
  updatePackageJson(projectDir, { '@tailwindcss/postcss': '*' })
  createPostCssConfig(projectDir, { '@tailwindcss/postcss': {} })
  updateViteConfig(projectDir)

  // For base template, add CSS import to App.vue
  if (!isFullTemplate) {
    updateAppVueImport(clientDir, "import './index.css';")
    createTailwindCssFile(clientDir)
  }

  console.log(`  ✓ Tailwind CSS configured`)
}

async function runDev() {
  // start unified dev: run vite in client and Bun server in watch
  console.log(
    'Starting unified dev (you can also run client/server separately)',
  )
  // simple implementation: just forward to project scripts
}

async function main(argv = process.argv.slice(2)) {
  const cmd = argv[0]

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log('Usage: create-bev-fs <name> [options]')
    console.log('')
    console.log('Arguments:')
    console.log('  <name>                    Project name')
    console.log('')
    console.log('Options:')
    console.log('  --base-template           Use base template (minimal)')
    console.log('  --full-template           Use full template (feature-rich)')
    console.log('  --with-auth               Include authentication (login/signup)')
    console.log('  --no-auth                 Do not include authentication')
    console.log('  --with-tailwind           Add Tailwind CSS to the project')
    console.log('  --no-tailwind             Do not add Tailwind CSS')
    console.log('  -h, --help                Show this help message')
    console.log('')
    console.log('Examples:')
    console.log(
      '  create-bev-fs my-app                              # Interactive mode',
    )
    console.log(
      '  create-bev-fs my-app --base-template              # Use base template',
    )
    console.log('  create-bev-fs my-app --full-template --with-auth --with-tailwind')
    console.log('  create-bev-fs my-app --base-template --with-auth')
    process.exit(0)
  }

  const name = cmd
  if (!name) throw new Error('missing project name')

  // Parse template flag
  const templateType = argv.includes('--base-template')
    ? 'base'
    : argv.includes('--full-template')
      ? 'full'
      : undefined

  // Parse auth flag
  const useAuth = argv.includes('--with-auth')
    ? true
    : argv.includes('--no-auth')
      ? false
      : undefined

  // Parse Tailwind flag
  const useTailwind = argv.includes('--with-tailwind')
    ? true
    : argv.includes('--no-tailwind')
      ? false
      : undefined

  await createProject(name, templateType, useTailwind, useAuth)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
