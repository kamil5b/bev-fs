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

async function createProject(name: string, templateType?: string) {
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
    throw new Error(`Template "${templateType}" not found`);
  }
  
  await fse.copy(templateDir, dest);
  
  // Rename dotfiles that npm doesn't package
  const gitignoreSrc = path.join(dest, "gitignore");
  if (fs.existsSync(gitignoreSrc)) {
    fs.renameSync(gitignoreSrc, path.join(dest, ".gitignore"));
  }
  
  const envExample = path.join(dest, "env.example");
  if (fs.existsSync(envExample)) {
    fs.renameSync(envExample, path.join(dest, ".env.example"));
  }
  
  const bunfigSrc = path.join(dest, "bunfig-template.toml");
  if (fs.existsSync(bunfigSrc)) {
    fs.renameSync(bunfigSrc, path.join(dest, "bunfig.toml"));
  }
  
  // Initialize git repository
  console.log("Initializing git repository...");
  try {
    execSync("git init", { cwd: dest, stdio: "pipe" });
  } catch (e) {
    console.warn("Failed to initialize git (git may not be installed)");
  }
  
  console.log("Project scaffolded to", dest);
  console.log("Run: cd %s && bun install && bun run dev", name);
}

async function runDev() {
  // start unified dev: run vite in client and Bun server in watch
  console.log("Starting unified dev (you can also run client/server separately)");
  // simple implementation: just forward to project scripts
}

async function main(argv = process.argv.slice(2)) {
  const cmd = argv[0];
  
  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    console.log("Usage: create-bev-fs <name> [--base-template|--full-template]");
    console.log("");
    console.log("Arguments:");
    console.log("  <name>                    Project name");
    console.log("");
    console.log("Options:");
    console.log("  --base-template           Use base template (minimal)");
    console.log("  --full-template           Use full template (feature-rich)");
    console.log("  -h, --help                Show this help message");
    console.log("");
    console.log("Examples:");
    console.log("  create-bev-fs my-app                      # Interactive selection (defaults to base)");
    console.log("  create-bev-fs my-app --base-template      # Use base template");
    console.log("  create-bev-fs my-app --full-template      # Use full template");
    process.exit(0);
  }

  const name = cmd;
  if (!name) throw new Error("missing project name");
  
  // Check for template flags
  let templateType: string | undefined;
  if (argv.includes("--base-template")) {
    templateType = "base";
  } else if (argv.includes("--full-template")) {
    templateType = "full";
  }
  // Otherwise templateType remains undefined, will prompt user
  
  await createProject(name, templateType);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
