#!/usr/bin/env bun

import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, "./template");

async function createProject(name: string) {
  const dest = path.join(process.cwd(), name);
  if (fs.existsSync(dest)) throw new Error("Destination exists");
  await fse.copy(templateDir, dest);
  
  // Rename dotfiles that npm doesn't package
  const gitignoreSrc = path.join(dest, "gitignore");
  if (fs.existsSync(gitignoreSrc)) {
    fs.renameSync(gitignoreSrc, path.join(dest, ".gitignore"));
  }
  
  const bunfigSrc = path.join(dest, "bunfig-template.toml");
  if (fs.existsSync(bunfigSrc)) {
    fs.renameSync(bunfigSrc, path.join(dest, "bunfig.toml"));
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
  if (!cmd || cmd === "help") {
    console.log("create-bev-fs <name> — scaffold a new project");
    process.exit(0);
  }

  const name = cmd;
  if (!name) throw new Error("missing project name");
  await createProject(name);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
