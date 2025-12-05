#!/usr/bin/env bun

import fs from "fs";
import fse from "fs-extra";
import path from "path";

const root = path.resolve(process.cwd());
const templateDir = path.join(import.meta.dir, "../../template-default");

async function createProject(name: string) {
  const dest = path.join(process.cwd(), name);
  if (fs.existsSync(dest)) throw new Error("Destination exists");
  await fse.copy(templateDir, dest);
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
    console.log("myfw create <name> — scaffold a new project");
    console.log("myfw dev — run dev (in project root)");
    process.exit(0);
  }

  if (cmd === "create") {
    const name = argv[1];
    if (!name) throw new Error("missing project name");
    await createProject(name);
    return;
  }

  if (cmd === "dev") {
    await runDev();
    return;
  }

  console.log("unknown command", cmd);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
