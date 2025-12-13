import fs from 'fs'
import path from 'path'
import readline from 'readline'

interface RenameFile {
  from: string
  to: string
}

interface PromptOptions {
  query: string
  choices: string[]
}

/**
 * Interactive CLI prompt for user selection
 */
export function prompt(options: PromptOptions): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    console.log(`\n${options.query}`)
    options.choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`)
    })

    rl.question('\nSelect template (enter number): ', (answer) => {
      rl.close()
      const selected = parseInt(answer) - 1
      if (selected >= 0 && selected < options.choices.length) {
        resolve(options.choices[selected])
      } else {
        console.error('Invalid selection')
        resolve(options.choices[0]) // default to first option
      }
    })
  })
}

/**
 * Rename template files that npm doesn't package
 * Common pattern: gitignore -> .gitignore, env.example -> .env.example
 */
export function renameTemplateFiles(
  baseDir: string,
  files: RenameFile[] = [
    { from: 'gitignore', to: '.gitignore' },
    { from: 'env.example', to: '.env.example' },
    { from: 'bunfig-template.toml', to: 'bunfig.toml' },
  ],
): void {
  files.forEach(({ from, to }) => {
    const src = path.join(baseDir, from)
    if (fs.existsSync(src)) {
      fs.renameSync(src, path.join(baseDir, to))
    }
  })
}

/**
 * Update package.json with additional dependencies
 */
export function updatePackageJson(
  projectDir: string,
  deps: Record<string, string>,
): void {
  const packageJsonPath = path.join(projectDir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {}
  }

  Object.assign(packageJson.devDependencies, deps)

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
}

/**
 * Update vite.config.ts to include PostCSS configuration
 */
export function updateViteConfig(projectDir: string): void {
  const viteConfigPath = path.join(projectDir, 'vite.config.ts')
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8')

  if (!viteConfig.includes('postcss')) {
    viteConfig = viteConfig.replace(
      'export default defineConfig({',
      `export default defineConfig({
  css: {
    postcss: './postcss.config.js',
  },`,
    )
    fs.writeFileSync(viteConfigPath, viteConfig)
  }
}

/**
 * Create postcss.config.js with provided plugins
 */
export function createPostCssConfig(
  projectDir: string,
  plugins: Record<string, object>,
): void {
  const postcssConfigContent = `export default {
  plugins: ${JSON.stringify(plugins, null, 4)},
}
`
  fs.writeFileSync(
    path.join(projectDir, 'postcss.config.js'),
    postcssConfigContent,
  )
}

/**
 * Update App.vue to include CSS import statement
 */
export function updateAppVueImport(
  clientDir: string,
  importStatement: string,
): void {
  const appVuePath = path.join(clientDir, 'App.vue')
  let appVueContent = fs.readFileSync(appVuePath, 'utf-8')

  if (!appVueContent.includes('index.css')) {
    appVueContent = appVueContent.replace(
      '<script setup lang="ts">\n</script>',
      `<script setup lang="ts">\n${importStatement}\n</script>`,
    )
    fs.writeFileSync(appVuePath, appVueContent)
  }
}

/**
 * Create Tailwind CSS file with default imports
 */
export function createTailwindCssFile(clientDir: string): void {
  fs.writeFileSync(
    path.join(clientDir, 'index.css'),
    `@import "tailwindcss";\n`,
  )
}

/**
 * Copy shared client resources from source to client directory
 * This reduces duplication when styling differences exist only in CSS
 */
export function setupSharedClientResources(
  clientDir: string,
  sharedClientDir: string,
  excludeDirs: string[] = ['styles'],
): void {
  // Copy composables if not already present
  const composablesSource = path.join(sharedClientDir, 'composables')
  const composablesDest = path.join(clientDir, 'composables')

  if (fs.existsSync(composablesSource) && !fs.existsSync(composablesDest)) {
    fs.cpSync(composablesSource, composablesDest, { recursive: true })
  }

  // Copy pages if not already present
  const pagesSource = path.join(sharedClientDir, 'pages')
  const pagesDest = path.join(clientDir, 'pages')

  if (fs.existsSync(pagesSource) && !fs.existsSync(pagesDest)) {
    fs.cpSync(pagesSource, pagesDest, { recursive: true })
  }

  // Note: Components and styles are intentionally NOT copied as they may differ
  // between implementations (e.g., Tailwind vs vanilla CSS versions)
}

/**
 * Consolidate shared client resources (composables, pages, router, main.ts, index.html)
 * Eliminates duplication between client and client-tailwind variants
 * 
 * When user selects Tailwind:
 * 1. client-tailwind replaces client (for styled components)
 * 2. This function restores shared logic (composables, pages, router, main.ts, index.html)
 * 3. Removes the need to maintain two complete copies
 */
export function consolidateClientResources(projectDir: string): void {
  const clientDir = path.join(projectDir, 'src/client')
  const clientSharedDir = path.join(projectDir, 'src/client-shared')

  // Skip if shared client doesn't exist
  if (!fs.existsSync(clientSharedDir)) {
    return
  }

  // Restore shared resources to client directory
  const sharedResourceDirs = ['composables', 'pages', 'router']

  sharedResourceDirs.forEach((resource) => {
    const sharedPath = path.join(clientSharedDir, resource)
    const clientPath = path.join(clientDir, resource)

    // If shared resource exists and client doesn't, copy it
    if (fs.existsSync(sharedPath) && !fs.existsSync(clientPath)) {
      fs.cpSync(sharedPath, clientPath, { recursive: true })
    }
  })

  // Restore main.ts from shared (identical in both variants)
  const sharedMainPath = path.join(clientSharedDir, 'main.ts')
  const clientMainPath = path.join(clientDir, 'main.ts')

  if (fs.existsSync(sharedMainPath)) {
    fs.copyFileSync(sharedMainPath, clientMainPath)
  }

  // Restore index.html from shared (essentially identical, shared version has no styling class)
  const sharedIndexPath = path.join(clientSharedDir, 'index.html')
  const clientIndexPath = path.join(clientDir, 'index.html')

  if (fs.existsSync(sharedIndexPath)) {
    fs.copyFileSync(sharedIndexPath, clientIndexPath)
  }
}

/**
 * Consolidate shared template files to reduce duplication
 * Copies common config files (tsconfig.json, vite.config.ts, bunfig-template.toml)
 * from shared-template to both base and template directories
 */
export function setupSharedTemplateFiles(templateDir: string): void {
  const sharedDir = path.join(path.dirname(templateDir), 'shared-template')

  if (!fs.existsSync(sharedDir)) {
    return // Shared template not found, skip consolidation
  }

  // List of files that should be shared between all templates
  const sharedFiles = ['tsconfig.json', 'vite.config.ts', 'bunfig-template.toml']

  sharedFiles.forEach((file) => {
    const source = path.join(sharedDir, file)
    const dest = path.join(templateDir, file)

    if (fs.existsSync(source) && !fs.existsSync(dest)) {
      fs.copyFileSync(source, dest)
    }
  })
}
