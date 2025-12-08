#!/usr/bin/env bun

import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PromptOptions {
  query: string;
  choices: string[];
}

function prompt(options: PromptOptions): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`\n${options.query}`);
    options.choices.forEach((choice, index) => {
      console.log(`  ${index + 1}. ${choice}`);
    });

    rl.question("\nSelect template (enter number): ", (answer) => {
      rl.close();
      const selected = parseInt(answer) - 1;
      if (selected >= 0 && selected < options.choices.length) {
        resolve(options.choices[selected]);
      } else {
        console.error("Invalid selection");
        resolve(options.choices[0]); // default to first option
      }
    });
  });
}

async function createProject(name: string, templateType?: string, useTailwind?: boolean) {
  const dest = path.join(process.cwd(), name);
  if (fs.existsSync(dest)) throw new Error("Destination exists");
  
  // Use provided template or prompt for selection
  if (!templateType) {
    templateType = await prompt({
      query: "Which template would you like to use?",
      choices: ["base", "full"],
    });
  }
  
  // Normalize template name
  templateType = templateType === "full" ? "template" : "base";
  
  const templateDir = path.join(__dirname, `./${templateType}`);
  
  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Template not found: ${templateDir}`);
    console.error("Run: npm run build");
    process.exit(1);
  }
  
  console.log(`📦 Creating project structure...`);
  
  // Clean destination if it exists
  if (fs.existsSync(dest)) {
    await fse.remove(dest);
  }
  
  await fse.copy(templateDir, dest);
  
  // Prompt for Tailwind support if not provided
  if (useTailwind === undefined) {
    const tailwindChoice = await prompt({
      query: "Would you like to add Tailwind CSS?",
      choices: ["yes", "no"],
    });
    useTailwind = tailwindChoice === "yes";
  }
  
  // Configure Tailwind if requested
  if (useTailwind) {
    console.log(`🎨 Setting up Tailwind CSS...`);
    if (templateType === "base") {
      await setupTailwindBase(dest);
    } else {
      await setupTailwind(dest);
    }
  }
  
  // Rename dotfiles that npm doesn't package
  console.log(`📝 Configuring project...`);
  const filesToRename = [
    { from: "gitignore", to: ".gitignore" },
    { from: "env.example", to: ".env.example" },
    { from: "bunfig-template.toml", to: "bunfig.toml" },
  ];
  
  filesToRename.forEach(({ from, to }) => {
    const src = path.join(dest, from);
    if (fs.existsSync(src)) {
      fs.renameSync(src, path.join(dest, to));
    }
  });
  
  // Initialize git repository
  console.log(`🔧 Initializing git repository...`);
  try {
    execSync("git init", { cwd: dest, stdio: "pipe" });
  } catch (e) {
    console.warn("⚠️  Failed to initialize git (git may not be installed)");
  }
  
  console.log(`\n✨ Project created successfully!\n`);
  console.log(`📂 Location: ${dest}`);
  console.log(`\n🚀 Next steps:`);
  console.log(`   cd ${name}`);
  console.log(`   bun install`);
  console.log(`   bun run dev\n`);
}

// Helper functions for DRY refactoring
function updatePackageJson(projectDir: string, deps: Record<string, string>) {
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  
  Object.assign(packageJson.devDependencies, deps);
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
}

function updateViteConfig(projectDir: string) {
  const viteConfigPath = path.join(projectDir, "vite.config.ts");
  let viteConfig = fs.readFileSync(viteConfigPath, "utf-8");
  
  if (!viteConfig.includes("postcss")) {
    viteConfig = viteConfig.replace(
      "export default defineConfig({",
      `export default defineConfig({
  css: {
    postcss: './postcss.config.js',
  },`
    );
    fs.writeFileSync(viteConfigPath, viteConfig);
  }
}

function createPostCssConfig(projectDir: string, plugins: Record<string, object>) {
  const postcssConfigContent = `export default {
  plugins: ${JSON.stringify(plugins, null, 4)},
}
`;
  fs.writeFileSync(path.join(projectDir, "postcss.config.js"), postcssConfigContent);
}

function updateAppVueImport(clientDir: string, importStatement: string) {
  const appVuePath = path.join(clientDir, "App.vue");
  let appVueContent = fs.readFileSync(appVuePath, "utf-8");
  
  if (!appVueContent.includes("index.css")) {
    appVueContent = appVueContent.replace(
      "<script setup lang=\"ts\">\n</script>",
      `<script setup lang="ts">\n${importStatement}\n</script>`
    );
    fs.writeFileSync(appVuePath, appVueContent);
  }
}

async function setupTailwindBase(projectDir: string) {
  console.log(`  🎨 Configuring Tailwind v4...`);
  
  const clientDir = path.join(projectDir, "src/client");
  
  updatePackageJson(projectDir, { "@tailwindcss/postcss": "*" });
  createPostCssConfig(projectDir, { "@tailwindcss/postcss": {} });
  updateViteConfig(projectDir);
  updateAppVueImport(clientDir, "import './index.css';");
  
  // Create Tailwind CSS file with Tailwind v4 syntax
  fs.writeFileSync(path.join(clientDir, "index.css"), `@import "tailwindcss";\n`);
  
  console.log(`  ✓ Tailwind CSS configured`);
}

async function setupTailwind(projectDir: string) {
  console.log(`  🎨 Configuring Tailwind v4...`);
  
  const clientDir = path.join(projectDir, "src/client");
  const clientTailwindDir = path.join(projectDir, "src/client-tailwind");
  
  // Remove the default client directory
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true });
  }
  
  // Rename client-tailwind to client
  if (fs.existsSync(clientTailwindDir)) {
    fs.renameSync(clientTailwindDir, clientDir);
  } else {
    console.warn("  ⚠️  client-tailwind directory not found, skipping Tailwind setup");
    return;
  }
  
  updatePackageJson(projectDir, { "@tailwindcss/postcss": "*" });
  createPostCssConfig(projectDir, { "@tailwindcss/postcss": {} });
  updateViteConfig(projectDir);
  
  console.log(`  ✓ Tailwind CSS configured`);
}

async function runDev() {
  // start unified dev: run vite in client and Bun server in watch
  console.log("Starting unified dev (you can also run client/server separately)");
  // simple implementation: just forward to project scripts
}

async function main(argv = process.argv.slice(2)) {
  const cmd = argv[0];
  
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log("Usage: create-bev-fs <name> [options]");
    console.log("");
    console.log("Arguments:");
    console.log("  <name>                    Project name");
    console.log("");
    console.log("Options:");
    console.log("  --base-template           Use base template (minimal)");
    console.log("  --full-template           Use full template (feature-rich)");
    console.log("  --with-tailwind           Add Tailwind CSS to the project");
    console.log("  --no-tailwind             Do not add Tailwind CSS");
    console.log("  -h, --help                Show this help message");
    console.log("");
    console.log("Examples:");
    console.log("  create-bev-fs my-app                              # Interactive mode");
    console.log("  create-bev-fs my-app --base-template              # Use base template");
    console.log("  create-bev-fs my-app --full-template --with-tailwind");
    console.log("  create-bev-fs my-app --base-template --with-tailwind");
    process.exit(0);
  }

  const name = cmd;
  if (!name) throw new Error("missing project name");
  
  // Parse template flag
  const templateType = argv.includes("--base-template")
    ? "base"
    : argv.includes("--full-template")
      ? "full"
      : undefined;
  
  // Parse Tailwind flag
  const useTailwind = argv.includes("--with-tailwind")
    ? true
    : argv.includes("--no-tailwind")
      ? false
      : undefined;
  
  await createProject(name, templateType, useTailwind);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
