import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const publicDir = "./public";

try {
  await mkdir(publicDir, { recursive: true });

  // Copy index.html
  const indexHtml = await Bun.file("./src/client/index.html").text();
  await writeFile(join(publicDir, "index.html"), indexHtml);

  // Copy CSS
  const css = await Bun.file("./src/client/src/style.css").text();
  await mkdir(join(publicDir, "src"), { recursive: true });
  await writeFile(join(publicDir, "src/style.css"), css);

  console.log("✓ Build completed successfully!");
  console.log(`✓ Output: ${publicDir}/`);
} catch (error) {
  console.error("✗ Build failed:", error);
  process.exit(1);
}
